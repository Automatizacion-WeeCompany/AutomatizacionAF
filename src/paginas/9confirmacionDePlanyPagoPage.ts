import { Page } from "@playwright/test";
import { esperarOpcionesEnSelect } from "src/utilidades/SelectAleatoreo";

export class ConfirmacionDePlanYPagoPage {
    constructor(private readonly page: Page) { }

    async ClickBtnSiguienteConfirmacionDePlanYPago() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#NextStephConfirmPlan').click();
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
