import { expect, Page } from "@playwright/test";
import {
  esperarOpcionesEnSelect,
  seleccionarOpcionAleatoriaDesdeLocator,
} from "src/utilidades/SelectAleatoreo";

export class CuestionarioMedicoPt1Page {
  constructor(private readonly page: Page) {}

  private async seleccionarPersonaDesdeMenu(
    selectorBoton: string,
    selectorOpciones: string,
  ) {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const boton = iframe.locator(selectorBoton);
    const opciones = iframe.locator(selectorOpciones);

    for (let intento = 1; intento <= 2; intento++) {
      await boton.click({ timeout: 5000 });
      try {
        await opciones.first().waitFor({ state: "visible", timeout: 5000 });
        const total = await opciones.count();
        if (total === 0) {
          throw new Error("No hay personas disponibles para seleccionar");
        }
        const randomIndex = Math.floor(Math.random() * total);
        console.log(`Opcion seleccionada: ${randomIndex}`);
        await opciones.nth(randomIndex).click();
        return;
      } catch (error) {
        if (intento === 2) {
          const detalle = error instanceof Error ? `: ${error.message}` : "";
          throw new Error(
            `No se pudo desplegar el menú de personas ${selectorBoton}${detalle}`,
          );
        }
      }
    }
  }
  //Pregunta 1 ¿Alguno de los solicitantes es una persona políticamente expuesta?
  async CheckSiP1() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_24"]')
      .nth(0)
      .click();
  }
  async CheckNoP1() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_24"]')
      .nth(0)
      .click();
  }
  async ClickBtnAgregarPersonaP1() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#openModalPersonaSeguroExistente_24")
      .click();
  }
  async SeleccionaPersonaAfectadaP1() {
    await seleccionarOpcionAleatoriaDesdeLocator(
      this.page
        .frameLocator("iframe#ifCotizador")
        .locator("#SelectQuestion_1A"),
    );
  }
  async ClickBtnAgregarP1() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_1A")
      .click();
  }

  // Pregunta 2 ¿Alguno de los solicitantes tiene alguna cobertura médica previa o existente?
  async CheckSiP2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste"]')
      .nth(0)
      .click();
  }
  async CheckNoP2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste"]')
      .nth(0)
      .click();
  }
  async SeleccionarPersonaAleatoriaP2() {
    await this.seleccionarPersonaDesdeMenu(
      "#getSeguroMedicoExistente",
      ".btnActionNameUno",
    );
  }
  async SubirArchivoFirmaP2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('input[id^="inputCertificado_"]')
      .setInputFiles("./src/datos/PruebaAF.pdf");
  }

  async ClickBtnGuardarP2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#btnGuardarProcesoPaso2Parte1")
      .click();
  }

  // Pregunta 3 ¿Alguno de los solicitantes ha sido rechazado al aplicar a un seguro de vida o salud previamente, o se le ha aplicado una prima mayor a la estándar, o se le ha aplicado restricciones a su cobertura?
  async CheckSiP3() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiEstatus"]')
      .nth(0)
      .click();
  }
  async CheckNoP3() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoEstatus"]')
      .nth(0)
      .click();
  }
  async SeleccionarPersonaAleatoriaP3() {
    await this.seleccionarPersonaDesdeMenu(
      "#getPersonasEstatus",
      ".btnActionNameDos",
    );
  }
  async IngresarDetallesP3() {
    const { faker } = await import("@faker-js/faker");
    const detalleP2B = faker.string.alpha({ length: { min: 2, max: 25 } });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator(".inputInfoDetallada.form-control.valEmpty2")
      .pressSequentially(detalleP2B, { delay: 70 });
    return detalleP2B;
  }
  async ClickBtnGuardarP3() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#btnGuardarProcesoPaso2Parte2")
      .click();
  }

  //Pregunta 4 ¿Usted o alguno de los otros solicitantes tiene antecedentes familiares de diabetes, hipertensión, enfermedades cardíacas, cáncer, enfermedades congénitas o hereditarias?
  async CheckSiP4() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_23"]')
      .nth(0)
      .waitFor({ state: "visible", timeout: 15000 });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_23"]')
      .nth(0)
      .click();
  }
  async CheckNoP4() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_23"]')
      .nth(0)
      .click();
  }
  async ClickBtnAgregarPersonaP4() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const botonAgregar = iframe.locator("#openModalPersonaSeguroExistente_23");
    const selectorPersona = iframe.locator("#SelectQuestion_3C");

    for (let intento = 1; intento <= 3; intento++) {
      await botonAgregar.click();
      const modalListo = await selectorPersona
        .waitFor({ state: "visible", timeout: 5000 })
        .then(() => true)
        .catch(() => false);

      if (modalListo) {
        return;
      }
    }

    await expect(selectorPersona).toBeVisible({ timeout: 10000 });
  }
  async SeleccionarPersonaAfectadaP4() {
    const selectorPersona = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_3C");

    await expect(selectorPersona).toBeVisible({ timeout: 10000 });
    await esperarOpcionesEnSelect(
      selectorPersona,
      1,
      15000,
    );
    await seleccionarOpcionAleatoriaDesdeLocator(selectorPersona);
  }
  async IngresarDetallesP4() {
    const { faker } = await import("@faker-js/faker");
    const detalleP4 = faker.string.alpha({ length: { min: 2, max: 50 } });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#EnfermedadDolencia_3C")
      .pressSequentially(detalleP4, { delay: 70 });
    return detalleP4;
  }
  async ClickBtnAgregarP4() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_3C")
      .click();
  }

  //Pregunta 5 ¿Usted o alguno de los otros solicitantes ha consumido alguna vez lo siguiente, Productos de nicotina, Alcohol, Drogas Ilegales?
  async CheckSiP5() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_19"]')
      .nth(0)
      .click();
  }
  async CheckNoP5() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_19"]')
      .nth(0)
      .click();
  }
  async ClickBtnAgregarPersonaP5() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#openModalPersonaSeguroExistente_19")
      .click();
  }
  async SeleccionarPersonaAfectadaP5() {
    await seleccionarOpcionAleatoriaDesdeLocator(
      this.page.frameLocator("iframe#ifCotizador").locator("#SelectQuestion_S"),
    );
  }
  async SeleccionarsustanciaP5(Sustancia: string) {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectSustancia_S")
      .selectOption({ label: Sustancia }, { timeout: 10000 });
  }
  async checkIngiriendoSi() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="preguntaIngiereSi"]')
      .nth(0)
      .click();
  }
  async checkIngiriendoNo() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="preguntaIngiereNo"]')
      .nth(0)
      .click();
  }
  async IngresarDetallesP5() {
    const { faker } = await import("@faker-js/faker");
    const detalleP5 = faker.string.alpha({ length: { min: 2, max: 50 } });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#txtDetalleHabitos")
      .pressSequentially(detalleP5, { delay: 70 });
    return detalleP5;
  }
  async ClickBtnAgregarP5() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_S")
      .click();
  }

  //Pregunta 6 ¿Usted o alguno de los otros solicitantes tiene actualmente un médico tratante o ha consultado a un especialista en los últimos 2 años?
  async CheckSiP6() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiTiene"]')
      .nth(0)
      .click();
  }
  async CheckNoP6() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoTiene"]')
      .nth(0)
      .click();
  }
  async SeleccionarPersonaAleatoriaP6() {
    await this.seleccionarPersonaDesdeMenu(
      "#getSeguroActualPersonas",
      ".btnActionNameTres",
    );
  }
  async ClickbtnAgregarEspecialistaP6() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("button.addEspecialista")
      .click();
  }
  async IngresarNombreMedicoTratante() {
    const { faker } = await import("@faker-js/faker");
    const nombreMedicoTratante = faker.person.firstName();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#idInputNombreEspecialista")
      .pressSequentially(nombreMedicoTratante, { delay: 70 });
    return nombreMedicoTratante;
  }
  async IngresaNumeroTelefonoMedicoTratante() {
    const { faker } = await import("@faker-js/faker");
    const numeroTelefonoMedicoTratante = faker.phone.number();
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#idInputTelefonoEspecialista")
      .pressSequentially(numeroTelefonoMedicoTratante.toString(), {
        delay: 70,
      });
  }
  async SeleccionarEspecialidadMedicoTratante() {
    await seleccionarOpcionAleatoriaDesdeLocator(
      this.page
        .frameLocator("iframe#ifCotizador")
        .locator("#idSelectEspecialidad"),
    );
  }
  async IngresaMotivoConsultaMedicoTratante() {
    const { faker } = await import("@faker-js/faker");
    const motivoConsultaMedicoTratante = faker.string.alpha({
      length: { min: 2, max: 50 },
    });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#idInputMotivo")
      .pressSequentially(motivoConsultaMedicoTratante, { delay: 70 });
    return motivoConsultaMedicoTratante;
  }
  async IngresaFechaConsultaMedicoTratante() {
    const { faker } = await import("@faker-js/faker");
    const Dia = faker.number.int({ min: 1, max: 30 }).toString();
    const Mes = faker.number.int({ min: 1, max: 12 }).toString();
    const Anio = faker.number.int({ min: 2000, max: 2025 }).toString();
    const fechaConsultaMedicoTratante = `${Mes}/${Dia}/${Anio}`;
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#idFEchaUltimaConsulta")
      .pressSequentially(fechaConsultaMedicoTratante, { delay: 70 });
  }
  async IngresaDescripcionMedicoTratante() {
    const { faker } = await import("@faker-js/faker");
    const descripcionMedicoTratante = faker.string.alpha({
      length: { min: 2, max: 100 },
    });
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#IdDetalleTratamiento")
      .pressSequentially(descripcionMedicoTratante, { delay: 70 });
  }
  async ClickBtnGuardarMedicoTratante() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#btnGuardarEspecialistaMedico")
      .click();
  }
  //Finalizan preguntas
  async ClickBtnSiguiente() {
    await this.page.waitForTimeout(3000);
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#GostepTwo")
      .click();
  }
  async ClickBtnregresar() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#btnProcesoRegresarPasoUno")
      .click();
  }
  async ClickBtnCompartir() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#btnShareProcesoPasoDos")
      .click();
  }
}
