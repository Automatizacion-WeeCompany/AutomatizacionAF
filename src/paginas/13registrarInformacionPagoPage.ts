import { expect, Page } from "@playwright/test";

export class RegistrarInformacionPagoPage {
    constructor(private readonly page: Page) { }

    async checkSiPersonaQuePaga() {
        const opcionSi = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#option-si');
        const etiquetaSi = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('label.checkbox-design[for="option-si"]');

        await expect(opcionSi).toBeAttached({ timeout: 30000 });
        await expect(etiquetaSi).toBeVisible();
        await etiquetaSi.click();
        await expect(opcionSi).toBeChecked();
    }

    async checkNoPersonaQuePaga() {
        const opcionNo = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#option-no');
        const etiquetaNo = this.page
            .frameLocator('iframe#ifCotizador')
            .locator('label.checkbox-design[for="option-no"]');

        await expect(opcionNo).toBeAttached({ timeout: 30000 });
        await expect(etiquetaNo).toBeVisible();
        await etiquetaNo.click();
        await expect(opcionNo).toBeChecked();
    }

    async clickBtnContinuar() {
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const botonContinuar = frame.locator('#next-buttonDC');
        const formularioPagador = frame.locator('#FormContratrante');

        await expect(botonContinuar).toBeEnabled({ timeout: 30000 });
        // El primer clic despliega el formulario y registra el manejador que guarda
        // la información; el segundo clic confirma los datos y avanza al pago.
        await botonContinuar.click();
        await expect(formularioPagador).toBeVisible({ timeout: 10000 });
        await expect(frame.locator('#DContratante_Nombre')).not.toHaveValue('');
        await expect(frame.locator('#DContratante_ApellidoPat')).not.toHaveValue('');
        await expect(frame.locator('#DContratante_Correo')).not.toHaveValue('');
        await expect(frame.locator('#DContratante_PaisResidenciaSelect')).not.toHaveValue('');

        await botonContinuar.click();
        await expect(frame.locator('iframe#__buttonlist')).toBeAttached({
            timeout: 60000,
        });
    }
}
