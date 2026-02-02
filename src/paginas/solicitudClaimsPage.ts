import { Page } from "@playwright/test";

export class SolicitudClaimsPage {
    constructor(private readonly page: Page) { }

    async ClickBtnGenerarDocumentacion() {
        await this.page.click('#regeneraDocs')
    }
    async ClickBtnPrepolizaPagada() {
        await this.page.click('#polizaEstatus')
    }
    async ClickBtnAtenderSolicitud() {
        await this.page.getByText('Atender solicitud').click();
    }
    async ClickPestanaInformacionGeneral() {
        await this.page.locator('a[href="#InformacionGeneralEmision"]').click();
    }
    async ClickPestanaCoberturasDeSeguros() {
        await this.page.locator('a[href="#CoberturasSeguros"]').click();
    }
    async ClickPestanaCuestioanrio() {
        await this.page.locator('a[href="#Cuestionario"]').click();
    }
    async ClickPestanaPlanyFrecuenciaPago() {
        await this.page.locator('a[href="#PlanPago"]').click();
    }
    async ClickPestanaIdioma() {
        await this.page.locator('a[href="#Idioma"]').click();
    }
    async ClickPestanaLimitaciones() {
        await this.page.locator('a[href="#Exclusiones"]').click();
    }
    async ClickPestanaContrato() {
        await this.page.locator('a[href="#Contrato"]').click();
    }
}
