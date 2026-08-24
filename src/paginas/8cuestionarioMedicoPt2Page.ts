import { expect, Page } from "@playwright/test";

export class CuestionarioMedicoPt2Page {
  constructor(private readonly page: Page) {}

  private async seleccionarRespuesta(idOpcion: string) {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const opcion = iframe.locator(`#${idOpcion}`);
    const etiqueta = iframe.locator(`label[for="${idOpcion}"]`).first();

    await expect(etiqueta).toBeVisible({ timeout: 30000 });
    await etiqueta.click();
    await expect(opcion).toBeChecked();
  }

  async SeleccionarTodasLasRespuestasNo(
    preguntasExceptuadas: number[] = [],
  ) {
    const excepciones = new Set(preguntasExceptuadas);
    for (let numero = 1; numero <= 18; numero++) {
      if (excepciones.has(numero)) {
        continue;
      }
      await this.seleccionarRespuesta(`optNoExiste_${numero}`);
    }
  }

  private async abrirModalPersona(numero: number, pregunta: string) {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    const boton = iframe.locator(`#openModalPersonaSeguroExistente_${numero}`);
    const selectorPersona = iframe.locator(`#SelectQuestion_${pregunta}`);

    for (let intento = 1; intento <= 2; intento++) {
      await boton.click({ timeout: 5000 });
      try {
        await expect(selectorPersona).toBeVisible({ timeout: 5000 });
        return;
      } catch {
        if (intento === 2) {
          throw new Error(
            `No se abrió el modal para agregar persona en la pregunta ${pregunta}`,
          );
        }
      }
    }
  }

  //A. ¿Tumores malignos o benignos o cáncer?
  async CheckSiPA() {
    await this.seleccionarRespuesta("optSiExiste_1");
  }
  async CheckNoPA() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_1"]')
      .nth(0)
      .click();
  }
  //B. ¿Alguna enfermedad o diagnostico que haya requerido intervención quirúrgica?
  async CheckSiPB() {
    await this.seleccionarRespuesta("optSiExiste_2");
  }
  async CheckNoPB() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_2"]')
      .nth(0)
      .click();
  }
  //C. ¿Mareo, epilepsia, convulsiones, parálisis, accidente cerebrovascular, dolor de cabeza, trastorno del habla, retraso mental o del desarrollo, autismo, anomalía cerebral u otros trastornos neurológicos?
  async CheckSiPC() {
    await this.seleccionarRespuesta("optSiExiste_3");
  }
  async CheckNoPC() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_3"]')
      .nth(0)
      .click();
  }
  //D. ¿Depresión, ansiedad, psicosis, esquizofrenia u otros trastornos psiquiátricos?
  async CheckSiPD() {
    await this.seleccionarRespuesta("optSiExiste_4");
  }
  async CheckNoPD() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_4"]')
      .nth(0)
      .click();
  }
  //E. ¿Trastornos nasales, oculares, auditivos, de garganta o de piel?
  async CheckSiPE() {
    await this.seleccionarRespuesta("optSiExiste_5");
  }
  async CheckNoPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_5"]')
      .nth(0)
      .click();
  }
  //F. ¿Diabetes, trastorno de la glándula tiroidea o la hipófisis u otros trastornos endocrinos?
  async CheckSiPF() {
    await this.seleccionarRespuesta("optSiExiste_6");
  }
  async CheckNoPF() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_6"]')
      .nth(0)
      .click();
  }
  //G. ¿Hipertensión arterial, aneurisma, valvulopatía cardíaca, obstrucción de las arterias, embolia, arritmias, insuficiencia cardíaca u otros trastornos cardiovasculares?
  async CheckSiPG() {
    await this.seleccionarRespuesta("optSiExiste_7");
  }
  async CheckNoPG() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_7"]')
      .nth(0)
      .click();
  }
  //H. ¿Alergias, asma, dificultad para respirar, ronquera o tos persistente, enfisema, enfermedad pulmonar obstructiva crónica (EPOC), bronquitis, tuberculosis u otros trastornos de los pulmones o del sistema respiratorio?
  async CheckSiPH() {
    await this.seleccionarRespuesta("optSiExiste_8");
  }
  async CheckNoPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_8"]')
      .nth(0)
      .click();
  }
  //I. ¿Anemia, enfermedad de la coagulación de la sangre, hemofilia, inmunodeficiencia, lupus, esclerosis múltiple u otra enfermedad autoinmune o trastorno hematológico?
  async CheckSiPI() {
    await this.seleccionarRespuesta("optSiExiste_9");
  }
  async CheckNoPI() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_9"]')
      .nth(0)
      .click();
  }
  //J. ¿Neuritis, ciática, reumatismo, gota, artritis/artrosis, problemas de espalda, musculares, óseos, articulares, o de la columna vertebral, o accidentes?
  async CheckSiPJ() {
    await this.seleccionarRespuesta("optSiExiste_10");
  }
  async CheckNoPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_10"]')
      .nth(0)
      .click();
  }
  //K. ¿Úlcera, colitis, hepatitis, cirrosis, hemorragia intestinal, hernia, diverticulitis, pancreatitis u otros trastornos del sistema digestivo?
  async CheckSiPK() {
    await this.seleccionarRespuesta("optSiExiste_11");
  }
  async CheckNoPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_11"]')
      .nth(0)
      .click();
  }
  //L. ¿Nefritis, cálculos renales, quistes, insuficiencia renal u otros trastornos renales o del sistema urinario?
  async CheckSiPL() {
    await this.seleccionarRespuesta("optSiExiste_12");
  }
  async CheckNoPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_12"]')
      .nth(0)
      .click();
  }
  //M. ¿Problemas de mama, útero, ovarios, vagina, próstata, enfermedades venéreas o de transmisión sexual, enfermedad genital u otros trastornos de los órganos reproductivos?
  async CheckSiPM() {
    await this.seleccionarRespuesta("optSiExiste_13");
  }
  async CheckNoPM() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_13"]')
      .nth(0)
      .click();
  }
  //N. ¿Malformación, mutaciones genéticas, trastorno congénito o hereditario?
  async CheckSiPN() {
    await this.seleccionarRespuesta("optSiExiste_14");
  }
  async CheckNoPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_14"]')
      .nth(0)
      .click();
  }
  //O. ¿Son o han sido donantes, receptores o candidatos para trasplantes de órganos, células o tejidos o para prótesis ortopédicas?
  async CheckSiPO() {
    await this.seleccionarRespuesta("optSiExiste_15");
  }
  async CheckNoPO() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_15"]')
      .nth(0)
      .click();
  }
  //P. ¿Usted o alguno de los solicitantes ha tenido o tiene alguna enfermedad, trastorno, lesión o herida, signos o síntomas por los que se haya consultado o no a un médico, o ha recibido tratamiento por afecciones no mencionadas anteriormente?
  async CheckSiPP() {
    await this.seleccionarRespuesta("optSiExiste_16");
  }
  async CheckNoPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_16"]')
      .nth(0)
      .click();
  }
  //Q. ¿Usted o alguno de los solicitantes ha tomado o está tomando ahora algún medicamento?
  async CheckSiPQ() {
    await this.seleccionarRespuesta("optSiExiste_17");
  }
  async CheckNoPQ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_17"]')
      .nth(0)
      .click();
  }
  //R. ¿Usted o alguno de los solicitantes ha perdido o ganado peso en los últimos 12 meses?
  async CheckSiPR() {
    await this.seleccionarRespuesta("optSiExiste_18");
  }
  async CheckNoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_18"]')
      .nth(0)
      .click();
  }

  //Terminan preguntas
  async ClickBtnSiguiente() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#GostepFour")
      .click();
  }

  async esperarDestinoDespuesDelCuestionario(): Promise<
    "SeccionAdicional" | "ConfirmacionPlan"
  > {
    const destino = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#GostepFive:visible, #NextStephConfirmPlan:visible")
      .first();

    await expect(destino).toBeVisible({ timeout: 30000 });
    return (await destino.getAttribute("id")) === "GostepFive"
      ? "SeccionAdicional"
      : "ConfirmacionPlan";
  }

  //Captura cuestionario medico seccion 2
  //A. ¿Alguna solicitante está actualmente embarazada?
  async ClickCheckSiPA2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_20"]')
      .nth(0)
      .click();
  }
  async ClickCheckNoPA2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_20"]')
      .nth(0)
      .click();
  }
  //B. ¿Alguna solicitante ha estado embarazada? Indique el número de embarazos que ha tenido cualquier solicitante, incluidos partos naturales, abortos o cesáreas
  async ClickCheckSiPB2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_21"]')
      .nth(0)
      .click();
  }
  async ClickCheckNoPB2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_21"]')
      .nth(0)
      .click();
  }
  //C. ¿Alguna de las solicitantes ha presentado las siguientes condiciones o complicaciones? (Tratamientos de Fertilidad, Embarazo o el Parto, Múltiples embarazos, Hijos con una Enfermedad Congénita o Hereditaria)
  async ClickCheckSiPC2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optSiExiste_22"]')
      .nth(0)
      .click();
  }
  async ClickCheckNoPC2() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="optNoExiste_22"]')
      .nth(0)
      .click();
  }
  //Terminan preguntas
  async ClickBtnSiguienteSeccion2() {
    const iframe = this.page.frameLocator("iframe#ifCotizador");
    await iframe.locator("#GostepFive").click();
    await expect(iframe.locator("#NextStephConfirmPlan")).toBeVisible({
      timeout: 30000,
    });
  }
  //Se agregan los botónes para agregar persona Gyno Resendiz
  async CheckSiPAAgregarPersona() {
    await this.abrirModalPersona(1, "A");
  }

  async CheckSiPBAgregarPersona() {
    await this.abrirModalPersona(2, "B");
  }

  async CheckSiPCAgregarPersona() {
    await this.abrirModalPersona(3, "C");
  }

  async CheckSiPDAgregarPersona() {
    await this.abrirModalPersona(4, "D");
  }

  async CheckSiPEAgregarPersona() {
    await this.abrirModalPersona(5, "E");
  }

  async CheckSiPFAgregarPersona() {
    await this.abrirModalPersona(6, "F");
  }

  async CheckSiPGAgregarPersona() {
    await this.abrirModalPersona(7, "G");
  }

  async CheckSiPHAgregarPersona() {
    await this.abrirModalPersona(8, "H");
  }

  async CheckSiPIAgregarPersona() {
    await this.abrirModalPersona(9, "I");
  }

  async CheckSiPJAgregarPersona() {
    await this.abrirModalPersona(10, "J");
  }

  async CheckSiPKAgregarPersona() {
    await this.abrirModalPersona(11, "K");
  }

  async CheckSiPLAgregarPersona() {
    await this.abrirModalPersona(12, "L");
  }

  async CheckSiPMAgregarPersona() {
    await this.abrirModalPersona(13, "M");
  }

  async CheckSiPNAgregarPersona() {
    await this.abrirModalPersona(14, "N");
  }

  async CheckSiPOAgregarPersona() {
    await this.abrirModalPersona(15, "O");
  }

  async CheckSiPPAgregarPersona() {
    await this.abrirModalPersona(16, "P");
  }

  async CheckSiPQAgregarPersona() {
    await this.abrirModalPersona(17, "Q");
  }

  async CheckSiPRAgregarPersona() {
    await this.abrirModalPersona(18, "R");
  }
}
