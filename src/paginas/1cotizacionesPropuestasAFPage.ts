import { Page } from "@playwright/test";

export class CotizacionesPropuestasAFPage {
    constructor(private readonly page: Page) { }

    async clickBtnNuevaCotizacion() {
        await this.page.locator('#btnNuevaCotizacion').click({ timeout: 10000 });
    }
    async clickBtnLimpiar() {
        await this.page.locator('#btnLimpiar').click({ timeout: 10000 });
    }
    async clickBtnBuscar() {
        await this.page.locator('#btnBuscar').click({ timeout: 10000 });
    }
    async seleccionaEstatus() {
        await this.page.click('#slEstatus');
        await this.page.selectOption('#slEstatus', 'Completar datos');
    }
    async ingresaBusqueda() {
        await this.page.locator('filtro').focus();
        await this.page.waitForTimeout(120);
        await this.page.locator('#filtro').pressSequentially('Prueba', { delay: 70 });
    }
    async clickCheckSubagentes() {
        await this.page.locator('#cbSubAgentes').click({ timeout: 10000 });
    }
    async clickCheckVerTodos() {
        await this.page.locator('#cbVerTodos').click({ timeout: 10000 });
    }
}