import { expect, Page } from "@playwright/test";

export class ApliacionCompletaPage {
    constructor(private readonly page: Page) { }

    async clicBtnPagarAhora() {
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const botonPagarAhora = frame.locator('#btn_payNow');

        await expect(botonPagarAhora).toBeVisible({ timeout: 30000 });
        await expect(botonPagarAhora).toBeEnabled();
        await botonPagarAhora.click();

        await expect(frame.locator('#option-si')).toBeAttached({ timeout: 30000 });
        await expect(
            frame.locator('label.checkbox-design[for="option-si"]'),
        ).toBeVisible();
    }
}
