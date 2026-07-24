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
        await this.page.frameLocator('iframe#ifCotizador').locator('#GostepNextTYC').click();
    }
    async ClickBtnFirmaConsultor(): Promise<boolean> {
        const botonConfirmar = this.page.locator('#modalConfirmar #btnFirmar');
        const tarjetaFirma = this.page.locator('#modalTipoFirma #divCardDrawSignature');

        let procesoFirmaVisible = false;
        for (let intento = 1; intento <= 3; intento++) {
            procesoFirmaVisible = await expect.poll(
                async () =>
                    (await botonConfirmar.isVisible()) || (await tarjetaFirma.isVisible()),
                {
                    timeout: 10000,
                    message: 'El modal de firma del consultor no se abrió'
                }
            ).toBe(true).then(() => true).catch(() => false);

            if (procesoFirmaVisible) {
                break;
            }

            const botonSiguiente = this.page
                .frameLocator('iframe#ifCotizador')
                .locator('#GostepNextTYC');
            if (await botonSiguiente.isVisible()) {
                await botonSiguiente.click();
            }
        }

        if (!procesoFirmaVisible) {
            throw new Error('No se abrió el proceso de firma del consultor después de reintentar');
        }

        if (await botonConfirmar.isVisible()) {
            await botonConfirmar.click();
        }
        await expect(tarjetaFirma).toBeVisible({ timeout: 10000 });

        return procesoFirmaVisible;
    }
    async ClickBtnSubirFirmaConsultor() {
        const tarjetaSubirFirma = this.page.locator(
            '#modalTipoFirma #divCardUploadSignature'
        );

        if (await tarjetaSubirFirma.isVisible()) {
            await tarjetaSubirFirma.click();
            await expect(this.page.locator('#ModalCargarFirma')).toBeVisible({
                timeout: 10000
            });
        }
    }
    async SubirArchivoFirmaConsultor() {
        const archivoFirma = this.page.locator('#fiFirma');
        await archivoFirma.setInputFiles('./src/datos/Firma.png');
        await expect(this.page.locator('#uploadedFirma')).toHaveAttribute(
            'src',
            /^data:image\//,
            { timeout: 10000 }
        );
    }
    async ClickBtnFirmarConsultor() {
        const respuestaFirma = this.page.waitForResponse(
            response =>
                response.url().includes('/Cotizador/CargarImagenFirmaConsultor') &&
                response.request().method() === 'POST',
            { timeout: 30000 }
        );
        const navegacionAplicacion = this.page.waitForEvent('framenavigated', {
            predicate: frame => frame.url().includes('/AF/Application/'),
            timeout: 30000,
        });
        const consultaFirmas = this.page.waitForResponse(
            response =>
                response.url().includes('/API/api/Documentos/GetPoderNotarial') &&
                response.request().method() === 'POST',
            { timeout: 30000 }
        );

        const botonGuardarFirma = this.page.locator('#btnGuardarImagenFirma');
        await expect(botonGuardarFirma).toBeVisible({ timeout: 10000 });
        await botonGuardarFirma.click();

        const response = await respuestaFirma;
        if (!response.ok()) {
            throw new Error(`No se pudo guardar la firma del consultor: HTTP ${response.status()}`);
        }

        await navegacionAplicacion;
        const respuestaFirmas = await consultaFirmas;
        if (!respuestaFirmas.ok()) {
            throw new Error(`No se pudieron consultar las firmas: HTTP ${respuestaFirmas.status()}`);
        }

        const resultadoFirmas = await respuestaFirmas.json();
        const firmas = resultadoFirmas?.Data?.Table?.[0];
        if (!firmas?.FirmaContratoSolicitante || !firmas?.FirmaContratoConsultor) {
            throw new Error('La aplicacion no confirmo ambas firmas antes de continuar');
        }

        await expect(
            this.page.frameLocator('iframe#ifCotizador').locator('#GostepNextTYC')
        ).toBeVisible({ timeout: 30000 });
    }
    async ClickBtnDibujaTuFirmaConsultor() {
        await this.page
            .locator('#modalTipoFirma #divCardDrawSignature')
            .click({ timeout: 10000 });
    }
    async DibujaFirmaConsultor() {
        const canvas = this.page
            .locator('#modalDibujarFirma #bcPaintCanvas');

        // Esperar a que el canvas esté visible
        await canvas.waitFor({ state: 'visible', timeout: 10000 });

        const box = await canvas.boundingBox();
        if (!box) {
            throw new Error('❌ No se pudo obtener el tamaño del canvas');
        }

        // Punto inicial dentro del canvas (zona segura)
        const startX = box.x + box.width * 0.2;
        const startY = box.y + box.height * 0.5;

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();

        // Trazo tipo firma (ligeramente aleatorio)
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

        // Soltar mouse
        await this.page.mouse.up();

        console.log('Firma dibujada correctamente');
    }
    async ClickBtnFirmarDibujaTuFirmaConsultor() {
        await this.page
            .locator('#modalDibujarFirma #btnFirmar')
            .click({ timeout: 10000 });
    }

}
