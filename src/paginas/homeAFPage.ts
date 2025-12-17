import { Page } from "@playwright/test";

export class HomeAFPage {
    constructor(private readonly page: Page) { }

    async clickBtnCotizacion() {
        const boton = this.page.locator('.svg-quotation');
        await boton.hover();
        await boton.click();
    }
    async clickBtnPoliza() {
        const boton = this.page.locator('.svg-policy');
        await boton.hover();
        await boton.click();
    }
    async clickBtnComisiones() {
        const boton = this.page.locator('.svg-finances');
        await boton.hover();
        await boton.click();
    }
    async clickBtnIdioma() {
        await this.page.locator('.dropdown-toggle.btn-lang').click();
    }
    async clickBtnNombrePerfil() {
        await this.page.locator('.user-name').click();
    }
    async clickBtnNotificaciones() {
        await this.page.locator('.dropdown-toggle').click();
    }
    async clickBtnLiveChat() {
        await this.page.locator('#openPopup').click();
    }
    async clickBtnDolfin() {
        await this.page.locator('#openPopup').click();
    }
}