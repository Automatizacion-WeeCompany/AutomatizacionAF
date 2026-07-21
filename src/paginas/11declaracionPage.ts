import { expect, Page } from "@playwright/test";

export class DeclaracionPage {
    constructor(private readonly page: Page) { }

    async ClickBtnAceptaryFirmar() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#FirmarContratoCotizador').click();
    }
    async ClickBtnContinuarModal() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#btnContinuarFirmas').click();
    }
    async clickBtnSubirFirma() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#divCardUploadSignature').click();
    }
    async SubirArchivoFirma() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#frmUploadSignature_UploadFile').setInputFiles('./src/datos/Firma.png');
    }
    async ClickBtnGuardarFirmas() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#frmUploadSignature-saveuploadfile').click();
    }
    async ClickBtnGuardarDeclaracion() {
        await this.page
            .frameLocator('iframe#ifCotizador')
            .locator('#btnGuardarProcesoTYC')
            .click({ timeout: 10000 });
    }
    async ClickBtnSiguienteDeclaracion() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#GostepNextTYC').click({ delay: 3000 });
    }
    async ClickBtnFirmaConsultor() {
        const botonConfirmar = this.page.locator('#modalConfirmar #btnFirmar');
        const tarjetaFirma = this.page.locator('#modalTipoFirma #divCardDrawSignature');

        await expect.poll(
            async () =>
                (await botonConfirmar.isVisible()) || (await tarjetaFirma.isVisible()),
            {
                timeout: 10000,
                message: 'No se abrió el proceso de firma del consultor'
            }
        ).toBe(true);

        if (await botonConfirmar.isVisible()) {
            await botonConfirmar.click();
        }
        await expect(tarjetaFirma).toBeVisible({ timeout: 10000 });
    }
    async ClickBtnSubirFirmaConsultor() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#divCardUploadSignature').click();
    }
    async SubirArchivoFirmaConsultor() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#btnCargaImagenFirma').setInputFiles('./src/datos/Firma.png');
    }
    async ClickBtnFirmarConsultor() {
        await this.page.frameLocator('iframe#ifCotizador').locator('#btnGuardarImagenFirma').click();
    }
    async ClickBtnDibujaTuFirmaConsultor() {
        await this.page
            .locator('#modalTipoFirma #divCardDrawSignature')
            .click({ timeout: 10000 });
    }
    async DibujaFirmaConsultor() {
        const canvas = this.page
            .locator('#modalDibujarFirma #bcPaintCanvas');

        // 1️⃣ Esperar a que el canvas esté visible
        await canvas.waitFor({ state: 'visible', timeout: 10000 });

        const box = await canvas.boundingBox();
        if (!box) {
            throw new Error('❌ No se pudo obtener el tamaño del canvas');
        }

        // 2️⃣ Punto inicial dentro del canvas (zona segura)
        const startX = box.x + box.width * 0.2;
        const startY = box.y + box.height * 0.5;

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();

        // 3️⃣ Trazo tipo firma (ligeramente aleatorio)
        const movimientos = [
            { x: 80, y: -30 },
            { x: 60, y: 40 },
            { x: 100, y: -10 },
            { x: 70, y: 30 }
        ];

        let currentX = startX;
        let currentY = startY;

        for (const move of movimientos) {
            currentX += move.x + Math.random() * 10;
            currentY += move.y + Math.random() * 10;

            await this.page.mouse.move(currentX, currentY, {
                steps: 12
            });
        }

        // 4️⃣ Soltar mouse
        await this.page.mouse.up();

        console.log('Firma dibujada correctamente');
    }

    // async DibujaFirmaConsultor() {
    //     // 1. Localizamos el canvas
    //     const canvas = this.page.locator('#bcPaintCanvas');
    //     // 2. Obtenemos el tamaño y posición del elemento
    //     const box = await canvas.boundingBox();
    //     if (box) {
    //         // Calculamos el centro o un punto inicial dentro del canvas
    //         const startX = box.x + 50;
    //         const startY = box.y + 50;
    //         // 3. Iniciamos la acción de firmado
    //         // Movemos el ratón al punto inicial
    //         await this.page.mouse.move(startX, startY);
    //         // Presionamos el botón izquierdo (clic sostenido)
    //         await this.page.mouse.down();
    //         // 4. Dibujamos moviendo el ratón a distintos puntos
    //         // Usamos 'steps' para que el movimiento sea más fluido/humano
    //         await this.page.mouse.move(startX + 100, startY + 20, { steps: 10 });
    //         await this.page.mouse.move(startX + 50, startY + 100, { steps: 10 });
    //         await this.page.mouse.move(startX + 200, startY + 80, { steps: 10 });
    //         // 5. Soltamos el ratón para terminar la firma
    //         await this.page.mouse.up();
    //     } else {
    //         throw new Error("No se pudo obtener el tamaño del canvas");
    //     }
    // }
    async ClickBtnFirmarDibujaTuFirmaConsultor() {
        await this.page
            .locator('#modalDibujarFirma #btnFirmar')
            .click({ timeout: 10000 });
    }

}
