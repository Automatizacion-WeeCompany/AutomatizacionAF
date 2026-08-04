import { expect, Page } from "@playwright/test";

export class ResumenPlanesCotizadosPage {
    constructor(private readonly page: Page) { }
    async ClickBtnAplicarAhora() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const botonAplicar = iframe.locator('button.btn-aplicaAhora:visible');
        const botonContestarAhora = iframe.locator('#AnswerFormNow');

        await expect(botonAplicar).toBeVisible({ timeout: 30000 });
        await expect(botonAplicar).toBeEnabled();
        await botonAplicar.scrollIntoViewIfNeeded();

        for (let intento = 1; intento <= 2; intento++) {
            if (intento === 1) {
                await botonAplicar.click();
            } else {
                await botonAplicar.evaluate((boton: HTMLButtonElement) => boton.click());
            }

            const modalVisible = await botonContestarAhora
                .waitFor({ state: 'visible', timeout: 5000 })
                .then(() => true)
                .catch(() => false);

            if (modalVisible) {
                return;
            }
        }

        await expect(botonContestarAhora).toBeVisible({ timeout: 15000 });
    }
    async ClickBtnCompartir() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#openModalEnviar').click();
    }
    async ClickBtnDescargar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#openModalCompartir').click();
    }
    async ClickBtnImprimir() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#openModalDescargar').click();
    }
    async ClickBtnRegresar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#backPersonalizarView').click();
    }
    async ClickBtnContestarFormularioAhoraModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#AnswerFormNow').click();
    }
    async ClickBtnEnviarFormularioClienteModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#SendFormClient').click();
    }
    async ClickBtnCerrarModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.btn-rounded-primary.btn-close-modal').click();
    }
}

export class CompartirCotizacionPage {
    constructor(private readonly page: Page) { }
    async SeleccionaIdioma(Idioma: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idiomaSelectEnviar').selectOption(Idioma);
    }
    async SeleccionaMedioDeEnvio(Medio: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#medioSelectEnviar').selectOption(Medio);
    }
    async IngresaCorreoElectronico(Correo: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#txtCorreoSend').fill(Correo);
    }
    async ClickBtnEnviar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#SendEmailCot').click();
    }
    async ClickBtnCerrarModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.btn-rounded-primary.btn-close-modal').click();
    }
}

export class DescargarCotizacionPage {
    constructor(private readonly page: Page) { }
    async SeleccionaIdioma(Idioma: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idiomaSelect').selectOption(Idioma);
    }
    async ClickBtnDescargar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.terciary-btn-blue').click();
    }
    async ClickBtnCerrarModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.btn-rounded-primary.btn-close-modal').click();
    }
}

export class ImprimirCotizacionPage {
    constructor(private readonly page: Page) { }
    async SeleccionaIdioma(Idioma: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idiomaSelectPrint').selectOption(Idioma);
    }
    async ClickBtnImprimeAhora() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#Step2_ImprimeCot').click();
    }
    async ClickBtnCerrarModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('.btn-rounded-primary.btn-close-modal').click();
    }
}
