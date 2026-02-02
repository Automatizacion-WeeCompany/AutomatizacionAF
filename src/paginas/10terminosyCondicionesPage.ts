import { Page } from "@playwright/test";

export class TerminosyCondicionesPage {
    constructor(private readonly page: Page) { }
    async ClickBtnAceptarTerminosyCondiciones() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#Btn-Aceptar').click();
    }
    async ClickBtnSiguienteTerminosyCondiciones() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#Btn-Siguiente').click();
    }
}