import { expect, Page } from "@playwright/test";

export class TarifaNoDisponibleError extends Error {
    constructor(detalle: string) {
        super(detalle);
        this.name = 'TarifaNoDisponibleError';
    }
}

export class ResumenCotizacionPage {
    constructor(private readonly page: Page) { }

    async obtenerTarifaAplicable() {
        const frame = this.page.frameLocator('iframe#ifCotizador');
        const tarifas = frame.locator(
            '#ContainerPlan1 .container__price__info .monto:visible, .container__price__info .monto:visible',
        );

        let textos: string[] = [];
        const obtenerTarifaPositiva = (valores: string[]) => valores.find((texto) => {
            const coincidencia = texto.match(/\$\s*([\d,.]+)\s*(?:USD)?/i);
            if (!coincidencia) {
                return false;
            }

            const monto = Number(coincidencia[1].replace(/,/g, ''));
            return Number.isFinite(monto) && monto > 0;
        });

        try {
            await expect.poll(
                async () => {
                    textos = (await tarifas.allInnerTexts())
                        .map((texto) => texto.replace(/\s+/g, ' ').trim())
                        .filter(Boolean);
                    return Boolean(obtenerTarifaPositiva(textos));
                },
                {
                    timeout: 30000,
                    message: 'No se mostró una tarifa para la configuración seleccionada',
                },
            ).toBe(true);
        } catch {
            throw new TarifaNoDisponibleError(
                `No se mostró una tarifa monetaria positiva. Valores visibles: ${textos.join(' | ') || 'ninguno'}`,
            );
        }

        const tarifa = obtenerTarifaPositiva(textos);

        if (!tarifa) {
            throw new TarifaNoDisponibleError(
                `La cotización no generó una tarifa monetaria positiva. Valores visibles: ${textos.join(' | ') || 'ninguno'}`,
            );
        }

        await expect(frame.locator('#GoResumenCotizacion')).toBeVisible();
        await expect(frame.locator('#GoResumenCotizacion')).toBeEnabled();
        return tarifa;
    }

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
