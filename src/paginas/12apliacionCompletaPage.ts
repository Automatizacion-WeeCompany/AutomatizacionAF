import { expect, Page } from "@playwright/test";
import { Idioma } from "src/utilidades/validacionIdiomas";
import { registrarInfo } from "../utilidades/LoggerPruebas";
import { DatosTarifaVisible } from "../types/ValidacionTarifas";
import {
    obtenerTarifaVisible,
    TarifaNoDisponibleError,
} from "../utilidades/ExtraerTarifaVisible";

const EVALUACION_POR_IDIOMA: Record<
    Idioma,
    { patron: RegExp; mensajeEsperado?: string }
> = {
    Esp: {
        patron: /evaluaci[oó]n|evaluad[ao]/i,
    },
    Eng: {
        patron: /evaluation|evaluated|review/i,
        mensajeEsperado:
            'The application will be evaluated, and a notification will be sent via email once a decision has been made.',
    },
    Port: {
        patron: /avalia[cç][aã]o|avaliad[ao]/i,
    },
};

export class AplicacionEnEvaluacionBMIError extends Error {
    constructor(detalle: string) {
        super(detalle);
        this.name = 'AplicacionEnEvaluacionBMIError';
    }
}

export class ApliacionCompletaPage {
    constructor(private readonly page: Page) { }

    async obtenerTarifaAplicable(
        opcional = false,
    ): Promise<DatosTarifaVisible | undefined> {
        const selector = '#costo_ConcluirPoliza:visible';
        const tarifa = await obtenerTarifaVisible(
            [
                {
                    locator: this.page.frameLocator('iframe#ifCotizador').locator(selector),
                    selector,
                },
            ],
            {
                timeout: opcional ? 5000 : 30000,
                opcional,
                mensaje: 'La pantalla de aplicación completa no mostró el costo',
            },
        );
        if (!tarifa && !opcional) {
            throw new TarifaNoDisponibleError(
                'La aplicación completa no generó una tarifa monetaria positiva',
            );
        }
        return tarifa;
    }

    async validarDisponibleParaPagoSinBMI(idioma: Idioma) {
        const { patron } = EVALUACION_POR_IDIOMA[idioma];
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const contenido = frame.locator('body');
        const botonPagarAhora = frame.locator('#btn_payNow');
        await expect.poll(
            async () => {
                if (
                    (await botonPagarAhora.isVisible()) &&
                    (await botonPagarAhora.isEnabled())
                ) {
                    return 'Pago';
                }

                const textoVisible = await contenido.innerText().catch(() => '');
                if (patron.test(textoVisible)) {
                    return 'EvaluacionBMI';
                }
                return 'Pendiente';
            },
            {
                timeout: 30000,
                message:
                    'La aplicación no llegó al pago ni informó una evaluación BMI',
            },
        ).not.toBe('Pendiente');

        const pagoDisponible =
            (await botonPagarAhora.isVisible()) &&
            (await botonPagarAhora.isEnabled());
        if (!pagoDisponible) {
            const textoVisible = await contenido.innerText().catch(() => '');
            const detalle = textoVisible
                .split(/\r?\n/)
                .map((linea) => linea.trim())
                .find((linea) => patron.test(linea));
            throw new AplicacionEnEvaluacionBMIError(
                detalle || 'La póliza fue enviada a evaluación BMI',
            );
        }

        await expect(botonPagarAhora).toBeVisible();
        await expect(botonPagarAhora).toBeEnabled();
    }

    async clicBtnPagarAhora() {
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const botonPagarAhora = frame.locator('#btn_payNow');

        await expect(botonPagarAhora).toBeVisible({ timeout: 30000 });
        await expect(botonPagarAhora).toBeEnabled();
        await botonPagarAhora.click();

        await expect(frame.locator('#option-si')).toBeAttached({ timeout: 30000 });
        await expect(
            frame.locator('label.checkbox-design[for="option-si"]'),
        ).toBeVisible();
    }

    async validarCotizacionEnEvaluacion(idioma: Idioma) {
        const { patron, mensajeEsperado } = EVALUACION_POR_IDIOMA[idioma];
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const contenido = frame.locator('body');

        await expect.poll(
            async () => patron.test(await contenido.innerText()),
            {
                timeout: 30000,
                message: 'No apareció la pantalla que indica que la cotización será evaluada',
            },
        ).toBe(true);

        const textoVisible = await contenido.innerText();
        const lineasEvaluacion = textoVisible
            .split(/\r?\n/)
            .map(linea => linea.trim())
            .filter(linea => patron.test(linea));

        expect(lineasEvaluacion.length).toBeGreaterThan(0);
        if (mensajeEsperado) {
            await expect(contenido).toContainText(mensajeEsperado);
        }
        await expect(frame.locator('#btn_payNow')).toBeHidden();
        await expect(frame.locator('#option-si')).toBeHidden();

        registrarInfo(`Cotización en evaluación: ${lineasEvaluacion.join(' ')}`);
        return lineasEvaluacion;
    }
}
