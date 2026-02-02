import { Page } from "@playwright/test";

export class ResumenCotizacionPage {
    constructor(private readonly page: Page) { }

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
