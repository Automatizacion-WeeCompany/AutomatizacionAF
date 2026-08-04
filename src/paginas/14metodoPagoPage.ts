import { expect, Page } from "@playwright/test";
import { Idioma } from '../utilidades/validacionIdiomas';

export interface DatosTarjetaPago {
    correo: string;
    telefono: string;
    numeroTarjeta: string;
    mesExpiracion: string;
    anioExpiracion: string;
    codigoSeguridad: string;
    nombre: string;
    apellido: string;
    pais: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
}

const TEXTOS_CONFIRMACION: Record<
    Idioma,
    {
        gracias: string;
        confianza: string;
        pagoCorrecto: string;
        etiquetaPoliza: string;
        preguntas: string;
    }
> = {
    Esp: {
        gracias: '¡Gracias,',
        confianza: 'por confiar en nosotros!',
        pagoCorrecto:
            'Se ha realizado su pago correctamente. En breve estará recibiendo detalles con los próximos pasos.',
        etiquetaPoliza: 'Número de póliza:',
        preguntas:
            'Si tienes alguna pregunta o necesita asistencia, por favor contactar nuestro equipo de atención al cliente a',
    },
    Eng: {
        gracias: 'Thank you,',
        confianza: 'for trusting us!',
        pagoCorrecto:
            'Your payment has been successfully processed. You will soon receive more details related to next steps.',
        etiquetaPoliza: 'Policy:',
        preguntas:
            'If you have any questions or need further assistance, please contact our customer care team at',
    },
    Port: {
        gracias: 'Obrigado,',
        confianza: 'por confiar em nós!',
        pagoCorrecto:
            'Seu pagamento foi processado com sucesso. Em breve você recebera informações com os próximos passos.',
        etiquetaPoliza: 'Número da apólice:',
        preguntas:
            'Se você tiver alguma dúvida ou precisar de assistência adicional, por favor entre em contato com a nossa equipe de atendimento ao cliente em',
    },
};

export class MetodoPagoPage {
    constructor(private readonly page: Page) { }

    private get frameAplicacion() {
        return this.page.frameLocator('iframe#ifCotizador');
    }

    private get frameMetodosPago() {
        return this.frameAplicacion.frameLocator('iframe#__buttonlist');
    }

    async clickBtnTarjetaDeCredito() {
        const iframeMetodos = this.frameAplicacion.locator('iframe#__buttonlist');
        await expect(iframeMetodos).toBeAttached({ timeout: 60000 });

        const urlCyberSource = await iframeMetodos.getAttribute('src');
        if (!urlCyberSource || !/(testup|apitest)\.cybersource\.com/i.test(urlCyberSource)) {
            throw new Error(
                'El pago automatizado solo puede ejecutarse en el ambiente de pruebas de CyberSource',
            );
        }

        // El orden de los métodos cambia según el idioma, pero CyberSource
        // conserva un nombre accesible reconocible para el pago con tarjeta.
        const botonTarjeta = this.frameMetodosPago
            .getByRole('button', {
                name: /Card payment|Pago con tarjeta/i,
            })
            .first();
        await expect(botonTarjeta).toBeVisible({ timeout: 30000 });
        await botonTarjeta.click();

        await expect(
            this.frameAplicacion
                .frameLocator('iframe#__mce')
                .locator('#contact-email'),
        ).toBeVisible({ timeout: 30000 });
    }

    async clickBtnGooglePay() {
        const frameGooglePay = this.frameMetodosPago.frameLocator('iframe');
        await frameGooglePay.getByRole('button', { name: /Google Pay/i }).click();
    }

    async clickBtnCuentaBancaria() {
        await this.frameMetodosPago
            .getByRole('button', { name: /Bank Account/i })
            .click();
    }
}

export class ModalSecureCheckoutPage {
    constructor(private readonly page: Page) {}

    private get frameAplicacion() {
        return this.page.frameLocator('iframe#ifCotizador');
    }

    private get frameCheckout() {
        return this.frameAplicacion.frameLocator('iframe#__mce');
    }

    private get botonConfirmarPago() {
        return this.frameCheckout.getByRole('button', {
            name: /Confirm and Continue|Confirmar y continuar|Confirmar e continuar/i,
        });
    }

    private async clickContinuarEtapa() {
        const botonContinuar = this.frameCheckout.locator('button[type="submit"]:visible');
        await expect(botonContinuar).toBeVisible({ timeout: 30000 });

        // El checkout se presenta en un panel lateral dentro de dos iframes.
        // CyberSource puede reportar el botón fuera del viewport interno aunque
        // esté visible en pantalla, por lo que ejecutamos el click del propio DOM.
        await botonContinuar.evaluate((boton: HTMLButtonElement) => boton.click());
    }

    async IngresaCorreoElectronico(correo: string) {
        await this.frameCheckout.locator('#contact-email').fill(correo);
    }

    async IngresaNumeroTelefonico(numeroTelefonico: string) {
        await this.frameCheckout.locator('#contact-phone').fill(numeroTelefonico);
    }

    async ClickBtnContinuar() {
        await this.clickContinuarEtapa();
        await expect(this.frameCheckout.locator('#card-number')).toBeVisible({
            timeout: 30000,
        });
    }

    async IngresaNumeroTarjeta(numeroTarjeta: string) {
        await this.frameCheckout.locator('#card-number').fill(numeroTarjeta);
    }

    async IngresaDatosTarjeta(datos: DatosTarjetaPago) {
        await this.IngresaNumeroTarjeta(datos.numeroTarjeta);
        await this.frameCheckout
            .locator('#card-expiry-month')
            .selectOption(datos.mesExpiracion);
        await this.frameCheckout
            .locator('#card-expiry-year')
            .selectOption(datos.anioExpiracion);
        await this.frameCheckout
            .locator('#card-security-code')
            .fill(datos.codigoSeguridad);
        await this.frameCheckout.locator('#billing-first-name').fill(datos.nombre);
        await this.frameCheckout.locator('#billing-last-name').fill(datos.apellido);
        await this.frameCheckout.locator('#billing-country').selectOption(datos.pais);
        await this.frameCheckout.locator('#billing-address1').fill(datos.direccion);
        await this.frameCheckout.locator('#billing-locality').fill(datos.ciudad);
        await this.frameCheckout
            .locator('#billing-administrative-area')
            .selectOption(datos.estado);
        await this.frameCheckout
            .locator('#billing-postal-code')
            .fill(datos.codigoPostal);
    }

    async ClickBtnContinuarDatosTarjeta() {
        await this.clickContinuarEtapa();
        await expect(this.botonConfirmarPago).toBeVisible({ timeout: 30000 });
    }

    async ClickBtnConfirmarYContinuar() {
        const botonConfirmar = this.botonConfirmarPago;
        await expect(botonConfirmar).toBeEnabled({ timeout: 30000 });
        await botonConfirmar.evaluate((boton: HTMLButtonElement) => boton.click());

        await expect(this.frameAplicacion.locator('#redirectionModal')).toBeVisible({
            timeout: 60000,
        });
    }

    async ClickBtnContinuarConfirmacionPago() {
        const botonContinuar = this.frameAplicacion.locator(
            '#redirectionModal button.primary-button',
        );
        await expect(botonContinuar).toBeVisible();
        await botonContinuar.click();
    }
}

export class ConfirmacionPagoPage {
    constructor(private readonly page: Page) {}

    async validarConfirmacion(
        idioma: Idioma,
        confirmacionEsperada?: { nombreTitular?: string; numeroPoliza?: string },
    ) {
        const textos = TEXTOS_CONFIRMACION[idioma];
        if (!textos) {
            throw new Error(`Idioma no soportado en confirmación de pago: ${idioma}`);
        }

        const frame = this.page.frameLocator('iframe#ifCotizador');
        const body = frame.locator('body');
        const nombreTitular = frame.locator('#PolizaNombreTitular');
        const numeroPoliza = frame.locator('#NumeroPolizaCompra');

        await expect(numeroPoliza).toBeVisible({ timeout: 60000 });
        await expect(nombreTitular).not.toHaveText('');

        const nombre = (await nombreTitular.innerText()).trim();
        const poliza = (await numeroPoliza.innerText()).trim();

        await expect(body).toContainText(textos.gracias);
        await expect(body).toContainText(nombre);
        await expect(body).toContainText(textos.confianza);
        await expect(body).toContainText(textos.pagoCorrecto);
        await expect(body).toContainText(textos.etiquetaPoliza);
        await expect(body).toContainText(textos.preguntas);
        await expect(body).toContainText('customercare@americanfidelity.com');

        expect(poliza).toMatch(/^\d{12}$/);
        if (confirmacionEsperada?.nombreTitular) {
            expect(nombre).toBe(confirmacionEsperada.nombreTitular);
        }
        if (confirmacionEsperada?.numeroPoliza) {
            expect(poliza).toBe(confirmacionEsperada.numeroPoliza);
        }

        return { nombreTitular: nombre, numeroPoliza: poliza };
    }
}
