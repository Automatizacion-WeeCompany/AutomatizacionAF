import { Page } from "@playwright/test";

export class InicioSesionClaimsPage {
    constructor(private readonly page: Page) { }

    async ingresaCorreo(correo: string) {
        await this.page.fill('#frmMasterLogin_UserName', correo);
    }
    async ingresaContrasena(contrasena: string) {
        await this.page.fill('#frmMasterLogin_Password', contrasena);
    }
    async clickBtnOlvidasteContrasena() {
        await this.page.click('#frmMasterForgotPassword');
    }
    async clickBtnIniciarSesion() {
        await this.page.click('#frmMasterSession_OK');
    }
    async clickBtnCambioIdioma() {
        await this.page.click('');
    }
    async clickBtnAvisoDePrivacidadTyC() {
        await this.page.click('#labelTerminos');
    }
}