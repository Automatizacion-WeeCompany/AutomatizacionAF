import { Page, expect } from "@playwright/test";

export class ListaEmisionesPage {
    constructor(private readonly page: Page) { }

    async ClickBandejaNuevos() {
        await this.page.click('#NuevasEmisiones');
    }
    async ClickBandejaPendientes() {
        await this.page.click('#EmisionesPendientes');
    }
    async ClickBandejaAutorizadas() {
        await this.page.click('#EmisionesAutorizadas');
    }
    async ClickBandejaRechazados() {
        await this.page.click('#EmisionesRechazadas');
    }
    async IngresaBusquedaFolioSolicitante(FolioSolicitante: string) {
        await this.page.fill('#txtBusquedaEmisiones', FolioSolicitante);
    }
    async SeleccionaTipoPoliza(TipoPoliza: string) {
        await this.page.selectOption('#SelectPolizaAf', TipoPoliza);
    }
    async SeleccionaTipoPlan(TipoPlan: string) {
        await this.page.selectOption('#SelectPlanAF', TipoPlan);
    }
    async IngresaFechaInicio(FechaInicio: string) {
        await this.page.fill('#FechaInicioEmision', FechaInicio);
    }
    async IngresaFechaFin(FechaFin: string) {
        await this.page.fill('#FechaFinEmision', FechaFin);
    }
    async ClickBtnBuscar() {
        await this.page.click('#SearchWithFilters');
    }
    async ClickBtnEliminarFiltros() {
        await this.page.click('#DeleteAll');
    }
    async SeleccionaLaCotizacion(Folio: string) {
        const fila = this.page.locator('#tablaContainer tr', { has: this.page.locator('td', { hasText: Folio }) });
        await expect(fila).toBeVisible();
        await fila.locator('td.OpenCotizacion').first().click();
    }
}