import { Page } from "@playwright/test";

export class InicioSesionAFPage {
    constructor(private readonly page: Page) { }

    async ingresaCorreo(correo: string) {
        await this.page.fill('#Email', correo);
    }
    async ingresaContrasena(contrasena: string) {
        await this.page.fill('#Password', contrasena);
    }
    async clickBtnOlvidasteContrasena() {
        await this.page.click('#btnForgotPassword');
    }
    async clickBtnIniciarSesion() {
        await this.page.click('#btnLogin');
    }
    async clickBtnCambioIdioma() {
        await this.page.click('.dropdown-toggle.btn-lang');
    }
    async clickBtnAvisoDePrivacidadTyC() {
        await this.page.click('#');
    }
}