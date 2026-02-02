import { Page } from "@playwright/test";

export class HomeClaimsPage {
    constructor(private readonly page: Page) { }

    async clickBtnEmision() {
        await this.page.click('#c13');
    }
}