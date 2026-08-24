import { Page } from "@playwright/test";
import { esperarOpcionesEnSelect } from "../utilidades/SelectAleatoreo";

export class SeleccionarPlanesAFPage {
  constructor(private readonly page: Page) {}

  async seleccionarPlanSuperior() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#changePlan")
      .click();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="Superior"]')
      .nth(0)
      .click();
  }
  async seleccionarPlanOptima() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#changePlan")
      .click();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="Optima"]')
      .nth(0)
      .click();
  }
  async seleccionarPlanVital() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#changePlan")
      .click();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="Vital"]')
      .nth(0)
      .click();
  }
  async seleccionarPlanProtect() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#changePlan")
      .click();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="Protect"]')
      .nth(0)
      .click();
  }

  private async seleccionarRedProveedores(textoRed: string) {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const select = iframe.locator("#redesDeProveedor0");
    await esperarOpcionesEnSelect(select, 1, 15000);

    const valorRed = await select.locator("option").evaluateAll(
      (opciones, textoBuscado) =>
        opciones.find((opcion) =>
          opcion.textContent?.trim().includes(textoBuscado),
        )?.getAttribute("value") ?? "",
      textoRed,
    );

    if (!valorRed) {
      throw new Error(
        `No se encontró ninguna red de proveedores que contenga "${textoRed}"`,
      );
    }

    await select.selectOption(valorRed);

    // El cambio de red dispara una recarga AJAX que puede reemplazar el select
    // y dejarlo transitoriamente vacío. La configuración completa se valida
    // después de seleccionar también el deducible y la frecuencia de pago.
  }

  async seleccionaRedProveedoresUltra() {
    await this.seleccionarRedProveedores("Ultra");
  }

  async seleccionaRedProveedoresOpen() {
    await this.seleccionarRedProveedores("Open");
  }

  async seleccionaRedProveedoresPlus() {
    await this.seleccionarRedProveedores("Plus");
  }

  async seleccionaRedProveedoresCore() {
    await this.seleccionarRedProveedores("Core");
  }

  async seleccionaRedProveedoresSinCoberturaEEUU(textoRed: string) {
    await this.seleccionarRedProveedores(textoRed);
  }
  async seleccionaDeducible(Deducible: string) {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#Deducible0")
      .click({ delay: 1500 });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#Deducible0")
      .selectOption(Deducible, { timeout: 5000 });
  }
  async seleccionaFrecuanciaPagoMensual() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="radioFrecuenciaMensual"]')
      .click({ delay: 1500 });
  }
  async seleccionaFrecuanciaTrimestral() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="radioFrecuenciaTrimestral"]')
      .click({ delay: 1500 });
  }
  async seleccionaFrecuanciaSemestral() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="radioFrecuenciaSemestral"]')
      .click({ delay: 1500 });
  }
  async seleccionaFrecuanciaAnual() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="radioFrecuenciaAnual"]')
      .click({ delay: 1500 });
  }
  async asegurarConfiguracionPlan(
    RedProveedores: string,
    Deducible: string,
  ) {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const selectRed = iframe.locator("#redesDeProveedor0");
    const selectDeducible = iframe.locator("#Deducible0");

    const valorRed = await selectRed.locator("option").evaluateAll(
      (opciones, textoBuscado) =>
        opciones.find((opcion) =>
          opcion.textContent?.trim().includes(textoBuscado),
        )?.getAttribute("value") ?? "",
      RedProveedores,
    );
    const valorDeducible = await selectDeducible.locator("option").evaluateAll(
      (opciones, textoBuscado) =>
        opciones.find(
          (opcion) =>
            opcion.getAttribute("value") === textoBuscado ||
            opcion.textContent?.trim() === textoBuscado,
        )?.getAttribute("value") ?? "",
      Deducible,
    );

    if (!valorRed || !valorDeducible) {
      throw new Error(
        `No se encontró la configuración de plan: red "${RedProveedores}", deducible "${Deducible}"`,
      );
    }

    for (let intento = 1; intento <= 4; intento++) {
      if ((await selectRed.inputValue()) !== valorRed) {
        await selectRed.selectOption(valorRed);
      }
      if ((await selectDeducible.inputValue()) !== valorDeducible) {
        await selectDeducible.selectOption(valorDeducible);
      }

      // La aplicación regenera ambos selects por AJAX. Esta comprobación
      // posterior detecta y recupera valores perdidos durante ese render.
      await this.page.waitForTimeout(750);
      if (
        (await selectRed.inputValue()) === valorRed &&
        (await selectDeducible.inputValue()) === valorDeducible
      ) {
        return;
      }
    }

    throw new Error(
      `La configuración del plan no se estabilizó. Red actual: "${await selectRed.inputValue()}", deducible actual: "${await selectDeducible.inputValue()}"`,
    );
  }
  async clickBtnRegresar() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#backStepOne")
      .click();
  }
  async clickBtnContinuar() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#GoCotizar")
      .click();
  }
}
