import { Page, expect } from "@playwright/test"
import { esperarOpcionesEnSelect } from "../utilidades/SelectAleatoreo";

export class SeleccionarPlanesAFPage {
    constructor(private readonly page: Page) { }

    async seleccionarPlanSuperior() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#changePlan').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="Superior"]').nth(0).click();
    }
    async seleccionarPlanOptima() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#changePlan').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="Optima"]').nth(0).click();
    }
    async seleccionarPlanVital() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#changePlan').click();
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="Vital"]').nth(0).click();
    }
    // async seleccionaRedProveedoresUltra() {
    //     const selectRedProveedor = this.page.frameLocator('iframe#ifCotizador').locator('#redesDeProveedor0');
    //     await esperarOpcionesEnSelect(selectRedProveedor, 1, 5000);
    //     await selectRedProveedor.selectOption({ label: 'Ultra★' });
    // }
    async seleccionaRedProveedoresUltra() {
        const iframe = this.page.frameLocator('iframe#ifCotizador');
        const select = iframe.locator('#redesDeProveedor0');

        // 1. Esperamos a que las opciones estén cargadas (que haya más de una)
        await expect(select.locator('option')).toHaveCount(3, { timeout: 10000 });

        // 2. Buscamos el VALOR de la opción que contiene "Ultra"
        // Usamos filter para encontrar la opción que coincida con el texto (aunque tenga espacios o estrellas)
        const valorUltra = await select.locator('option')
            .filter({ hasText: /Ultra/ })
            .getAttribute('value');

        if (valorUltra) {
            // 3. Seleccionamos por el valor encontrado
            await select.selectOption(valorUltra);

            // 4. Disparamos el evento para que la web procese el cambio
            await select.dispatchEvent('change');
        } else {
            throw new Error("No se encontró ninguna opción que contenga 'Ultra'");
        }

        // Validación final
        await expect(select).not.toHaveValue('');
    }
    async seleccionaRedProveedoresPlus() {
        const selectRedProveedor = this.page.frameLocator('iframe#ifCotizador').locator('#redesDeProveedor0');
        await esperarOpcionesEnSelect(selectRedProveedor, 1, 5000);
        await selectRedProveedor.selectOption({ label: 'Plus' });
    }

    async seleccionaDeducible(Deducible: string) {
        await this.page.frameLocator('iframe#ifCotizador').locator('#Deducible0').click({ delay: 1500 });
        await this.page.frameLocator('iframe#ifCotizador').locator('#Deducible0').selectOption(Deducible, { timeout: 5000 });
    }
    async seleccionaFrecuanciaPagoMensual() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="radioFrecuenciaMensual"]').click({ delay: 1500 });
    }
    async seleccionaFrecuanciaTrimestral() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="radioFrecuenciaTrimestral"]').click({ delay: 1500 });
    }
    async seleccionaFrecuanciaSemestral() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="radioFrecuenciaSemestral"]').click({ delay: 1500 });
    }
    async seleccionaFrecuanciaAnual() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="radioFrecuenciaAnual"]').click({ delay: 1500 });
    }
    async clickBtnRegresar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#backStepOne').click();
    }
    async clickBtnContinuar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GoCotizar').click();
    }
}