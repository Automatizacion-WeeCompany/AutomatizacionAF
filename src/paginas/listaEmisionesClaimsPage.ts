import { Page, expect } from "@playwright/test";

export class ListaEmisionesPage {
    constructor(private readonly page: Page) { }

    private filaPorPoliza(numeroPoliza: string) {
        const polizaEscapada = numeroPoliza.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const celdaPoliza = this.page
            .locator('td')
            .filter({ hasText: new RegExp(`^\\s*${polizaEscapada}\\s*$`) });

        return this.page.locator('#tablaContainer tr', { has: celdaPoliza });
    }

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
    async IngresaBusquedaPoliza(numeroPoliza: string) {
        await this.page.fill('#txtBusquedaEmisiones', numeroPoliza);
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
    async SeleccionaLaPoliza(numeroPoliza: string) {
        const fila = this.filaPorPoliza(numeroPoliza);

        await expect(fila).toHaveCount(1, { timeout: 30000 });
        await expect(fila).toBeVisible();
        await fila.locator('td.OpenCotizacion').first().click();
    }

    async BuscarYSeleccionarPoliza(numeroPoliza: string) {
        const poliza = numeroPoliza.trim();
        if (!poliza) {
            throw new Error('El número de póliza es obligatorio para abrir la emisión');
        }

        const fila = this.filaPorPoliza(poliza);
        let encontrada = false;

        for (let intento = 1; intento <= 6; intento++) {
            await this.IngresaBusquedaPoliza(poliza);
            await this.ClickBtnBuscar();
            encontrada = await fila
                .first()
                .waitFor({ state: 'visible', timeout: 10000 })
                .then(() => true)
                .catch(() => false);

            if (encontrada) {
                break;
            }
        }

        if (!encontrada) {
            throw new Error(`No se encontró la póliza ${poliza} en Emisión`);
        }

        await this.SeleccionaLaPoliza(poliza);
    }
}
