import { expect, Page } from "@playwright/test";

export class HomeClaimsPage {
    constructor(private readonly page: Page) {}

    async clickBtnEmision() {
        const enlaceEmision = this.page.locator('a[href="#/Emision"]').first();

        await expect(enlaceEmision).toBeVisible({ timeout: 15000 });
        await enlaceEmision.click();
        await expect(this.page).toHaveURL(/#\/Emision(?:$|[/?])/);
        await expect(this.page.locator('#txtBusquedaEmisiones')).toBeVisible({
            timeout: 15000,
        });
    }
}
