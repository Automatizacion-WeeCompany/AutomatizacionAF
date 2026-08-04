import { expect, Page } from "@playwright/test";
import { Idioma } from "src/utilidades/validacionIdiomas";

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

export class ApliacionCompletaPage {
    constructor(private readonly page: Page) { }

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

        console.log(`Cotización en evaluación: ${lineasEvaluacion.join(' ')}`);
        return lineasEvaluacion;
    }
}
