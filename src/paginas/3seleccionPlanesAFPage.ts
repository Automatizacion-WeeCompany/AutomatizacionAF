import { Page, expect } from "@playwright/test";
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
  async seleccionaRedProveedoresUltra() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const select = iframe.locator("#redesDeProveedor0");
    // 1. Esperamos a que las opciones estén cargadas (que haya más de una)
    await expect(select.locator("option")).toHaveCount(3, { timeout: 10000 });
    // 2. Buscamos el VALOR de la opción que contiene "Ultra"
    // Usamos filter para encontrar la opción que coincida con el texto (aunque tenga espacios o estrellas)
    const valorUltra = await select
      .locator("option")
      .filter({ hasText: /Ultra/ })
      .getAttribute("value");
    if (valorUltra) {
      // 3. Seleccionamos por el valor encontrado
      await select.selectOption(valorUltra);
    } else {
      throw new Error("No se encontró ninguna opción que contenga 'Ultra'");
    }
    // Validación final
    await expect(select).toHaveValue(valorUltra);
  }
  async seleccionaRedProveedoresOpen() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const select = iframe.locator("#redesDeProveedor0");
    // 1. Esperamos a que las opciones estén cargadas (que haya más de una)
    await expect(select.locator("option")).toHaveCount(3, { timeout: 10000 });
    // 2. Buscamos el VALOR de la opción que contiene "Ultra"
    // Usamos filter para encontrar la opción que coincida con el texto (aunque tenga espacios o estrellas)
    const valorOpen = await select
      .locator("option")
      .filter({ hasText: /Open/ })
      .getAttribute("value");
    if (valorOpen) {
      // 3. Seleccionamos por el valor encontrado
      await select.selectOption(valorOpen);
    } else {
      throw new Error("No se encontró ninguna opción que contenga 'Open'");
    }
    // Validación final
    await expect(select).toHaveValue(valorOpen);
  }
  async seleccionaRedProveedoresPlus() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const select = iframe.locator("#redesDeProveedor0");
    // 1. Esperamos a que las opciones estén cargadas (que haya más de una)
    await expect(select.locator("option")).toHaveCount(3, { timeout: 10000 });
    // 2. Buscamos el VALOR de la opción que contiene "Ultra"
    // Usamos filter para encontrar la opción que coincida con el texto (aunque tenga espacios o estrellas)
    const valorPlus = await select
      .locator("option")
      .filter({ hasText: /Plus★/ })
      .getAttribute("value");
    if (valorPlus) {
      // 3. Seleccionamos por el valor encontrado
      await select.selectOption(valorPlus);
    } else {
      throw new Error("No se encontró ninguna opción que contenga 'Plus'");
    }
    // Validación final
    await expect(select).toHaveValue(valorPlus);
  }
  async seleccionaRedProveedoresCore() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const select = iframe.locator("#redesDeProveedor0");
    // 1. Esperamos a que las opciones estén cargadas (que haya más de una)
    await expect(select.locator("option")).toHaveCount(3, { timeout: 10000 });
    // 2. Buscamos el VALOR de la opción que contiene "Ultra"
    // Usamos filter para encontrar la opción que coincida con el texto (aunque tenga espacios o estrellas)
    const valorCore = await select
      .locator("option")
      .filter({ hasText: /Core/ })
      .getAttribute("value");
    if (valorCore) {
      // 3. Seleccionamos por el valor encontrado
      await select.selectOption(valorCore);
    } else {
      throw new Error("No se encontró ninguna opción que contenga 'Core'");
    }
    // Validación final
    await expect(select).toHaveValue(valorCore);
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
