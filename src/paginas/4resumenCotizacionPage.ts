import { expect, Page } from "@playwright/test";
import { DatosTarifaVisible } from "../types/ValidacionTarifas";
import {
    obtenerTarifaVisible,
    TarifaNoDisponibleError,
} from "../utilidades/ExtraerTarifaVisible";

export { TarifaNoDisponibleError } from "../utilidades/ExtraerTarifaVisible";

export class ResumenCotizacionPage {
    constructor(private readonly page: Page) { }

    async obtenerTarifaAplicable(): Promise<DatosTarifaVisible> {
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const tarifaPlanSeleccionado = frame.locator(
            '#ContainerPlan1 .container__price__info .monto:visible',
        );
        const tarifasVisibles = frame.locator('.container__price__info .monto:visible');
        const tarifa = await obtenerTarifaVisible(
            [
                {
                    locator: tarifaPlanSeleccionado,
                    selector: '#ContainerPlan1 .container__price__info .monto:visible',
                },
                {
                    locator: tarifasVisibles,
                    selector: '.container__price__info .monto:visible',
                },
            ],
            {
                mensaje: 'No se mostró una tarifa para la configuración seleccionada',
            },
        );
        if (!tarifa) {
            throw new TarifaNoDisponibleError(
                'La cotización no generó una tarifa monetaria positiva',
            );
        }

        await expect(frame.locator('#GoResumenCotizacion')).toBeVisible();
        await expect(frame.locator('#GoResumenCotizacion')).toBeEnabled();
        return tarifa;
    }

    async ClickBtnContinuar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GoResumenCotizacion').click();
    }
    async clickBtnRegresar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#backSteptwo').click();
    }
    async ClickBtnVerMasBeneficios() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#planOptionred-plan').click();
    }
    async SeleccionaNuevaRedProveedor() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#idSelectOption0').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#idSelectOption0').selectOption('Ultra★', { timeout: 5000 });
    }
    async SeleccionaNuevoDeducible() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#cotizacionDeducible0').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('#cotizacionDeducible0').selectOption('deducible', { timeout: 5000 });
    }
}
