import { expect, Page } from "@playwright/test";
import { esperarOpcionesEnSelect } from "src/utilidades/SelectAleatoreo";
import { DatosTarifaVisible } from "../types/ValidacionTarifas";
import {
    obtenerTarifaVisible,
    TarifaNoDisponibleError,
} from "../utilidades/ExtraerTarifaVisible";

export class ConfirmacionDePlanYPagoPage {
    constructor(private readonly page: Page) { }

    async obtenerTarifaAplicable(): Promise<DatosTarifaVisible> {
        const selector = '#MoneyLabel:visible';
        const tarifa = await obtenerTarifaVisible(
            [
                {
                    locator: this.page.frameLocator('iframe#ifCotizador').locator(selector),
                    selector,
                },
            ],
            { mensaje: 'La confirmación del plan no mostró el costo' },
        );
        if (!tarifa) {
            throw new TarifaNoDisponibleError(
                'La confirmación del plan no generó una tarifa monetaria positiva',
            );
        }
        return tarifa;
    }

    async ClickBtnSiguienteConfirmacionDePlanYPago() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const frecuenciaPago = iframe.locator('#FrecuenciaMemSelect');

        await expect(frecuenciaPago).not.toHaveValue('', { timeout: 30000 });
        await expect(iframe.locator('#MoneyLabel')).not.toHaveText('', { timeout: 30000 });
        await expect(iframe.locator('#Loader-Start')).toBeHidden({ timeout: 30000 });
        await iframe.locator('#NextStephConfirmPlan').click();
        await expect(iframe.locator('#Btn-Aceptar')).toBeVisible({ timeout: 30000 });
    }
    async SeleccionaNuevaRedProveedores() {
        const selectRedProveedor = this.page.frameLocator('iframe#ifCotizador').locator('#redesDeProveedor');
        await esperarOpcionesEnSelect(selectRedProveedor, 1, 5000);
        await selectRedProveedor.selectOption({ label: '' });
    }
    async SeleccionaNuevoDeducible() {
        const selectDeducible = this.page.frameLocator('iframe#ifCotizador').locator('#Deducible');
        await esperarOpcionesEnSelect(selectDeducible, 1, 5000);
        await selectDeducible.selectOption({ label: '' });
    }
    async SeleccionaNuevaFrecuenciaPago() {
        const selectFrecuenciaPago = this.page.frameLocator('iframe#ifCotizador').locator('#FrecuenciaMemSelect');
        await esperarOpcionesEnSelect(selectFrecuenciaPago, 1, 5000);
        await selectFrecuenciaPago.selectOption({ label: '' });
    }
}
