import { Page } from "@playwright/test";

export class CuestionarioMedicoPt2Page {
    constructor(private readonly page: Page) { }

    //A. ¿Tumores malignos o benignos o cáncer?
    async CheckSiPA() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_1"]').nth(0).click();
    }
    async CheckNoPA() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_1"]').nth(0).click();
    }
    //B. ¿Alguna enfermedad o diagnostico que haya requerido intervención quirúrgica?
    async CheckSiPB() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_2"]').nth(0).click();
    }
    async CheckNoPB() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_2"]').nth(0).click();
    }
    //C. ¿Mareo, epilepsia, convulsiones, parálisis, accidente cerebrovascular, dolor de cabeza, trastorno del habla, retraso mental o del desarrollo, autismo, anomalía cerebral u otros trastornos neurológicos?
    async CheckSiPC() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_3"]').nth(0).click();
    }
    async CheckNoPC() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_3"]').nth(0).click();
    }
    //D. ¿Depresión, ansiedad, psicosis, esquizofrenia u otros trastornos psiquiátricos?
    async CheckSiPD() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_4"]').nth(0).click();
    }
    async CheckNoPD() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_4"]').nth(0).click();
    }
    //E. ¿Trastornos nasales, oculares, auditivos, de garganta o de piel?
    async CheckSiPE() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_5"]').nth(0).click();
    }
    async CheckNoPE() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_5"]').nth(0).click();
    }
    //F. ¿Diabetes, trastorno de la glándula tiroidea o la hipófisis u otros trastornos endocrinos?
    async CheckSiPF() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_6"]').nth(0).click();
    }
    async CheckNoPF() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_6"]').nth(0).click();
    }
    //G. ¿Hipertensión arterial, aneurisma, valvulopatía cardíaca, obstrucción de las arterias, embolia, arritmias, insuficiencia cardíaca u otros trastornos cardiovasculares?
    async CheckSiPG() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_7"]').nth(0).click();
    }
    async CheckNoPG() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_7"]').nth(0).click();
    }
    //H. ¿Alergias, asma, dificultad para respirar, ronquera o tos persistente, enfisema, enfermedad pulmonar obstructiva crónica (EPOC), bronquitis, tuberculosis u otros trastornos de los pulmones o del sistema respiratorio?
    async CheckSiPH() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_8"]').nth(0).click();
    }
    async CheckNoPH() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_8"]').nth(0).click();
    }
    //I. ¿Anemia, enfermedad de la coagulación de la sangre, hemofilia, inmunodeficiencia, lupus, esclerosis múltiple u otra enfermedad autoinmune o trastorno hematológico?
    async CheckSiPI() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_9"]').nth(0).click();
    }
    async CheckNoPI() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_9"]').nth(0).click();
    }
    //J. ¿Neuritis, ciática, reumatismo, gota, artritis/artrosis, problemas de espalda, musculares, óseos, articulares, o de la columna vertebral, o accidentes?
    async CheckSiPJ() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_10"]').nth(0).click();
    }
    async CheckNoPJ() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_10"]').nth(0).click();
    }
    //K. ¿Úlcera, colitis, hepatitis, cirrosis, hemorragia intestinal, hernia, diverticulitis, pancreatitis u otros trastornos del sistema digestivo?
    async CheckSiPK() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_11"]').nth(0).click();
    }
    async CheckNoPK() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_11"]').nth(0).click();
    }
    //L. ¿Nefritis, cálculos renales, quistes, insuficiencia renal u otros trastornos renales o del sistema urinario?
    async CheckSiPL() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_12"]').nth(0).click();
    }
    async CheckNoPL() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_12"]').nth(0).click();
    }
    //M. ¿Problemas de mama, útero, ovarios, vagina, próstata, enfermedades venéreas o de transmisión sexual, enfermedad genital u otros trastornos de los órganos reproductivos?
    async CheckSiPM() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_13"]').nth(0).click();
    }
    async CheckNoPM() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_13"]').nth(0).click();
    }
    //N. ¿Malformación, mutaciones genéticas, trastorno congénito o hereditario?
    async CheckSiPN() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_14"]').nth(0).click();
    }
    async CheckNoPN() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_14"]').nth(0).click();
    }
    //O. ¿Son o han sido donantes, receptores o candidatos para trasplantes de órganos, células o tejidos o para prótesis ortopédicas?
    async CheckSiPO() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_15"]').nth(0).click();
    }
    async CheckNoPO() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_15"]').nth(0).click();
    }
    //P. ¿Usted o alguno de los solicitantes ha tenido o tiene alguna enfermedad, trastorno, lesión o herida, signos o síntomas por los que se haya consultado o no a un médico, o ha recibido tratamiento por afecciones no mencionadas anteriormente?
    async CheckSiPP() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_16"]').nth(0).click();
    }
    async CheckNoPP() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_16"]').nth(0).click();
    }
    //Q. ¿Usted o alguno de los solicitantes ha tomado o está tomando ahora algún medicamento?
    async CheckSiPQ() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_17"]').nth(0).click();
    }
    async CheckNoPQ() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_17"]').nth(0).click();
    }
    //R. ¿Usted o alguno de los solicitantes ha perdido o ganado peso en los últimos 12 meses?
    async CheckSiPR() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optSiExiste_18"]').nth(0).click();
    }
    async CheckNoPR() {
        await this.page.frameLocator('iframe#ifCotizador').locator('label[for="optNoExiste_18"]').nth(0).click();
    }

    //Terminan preguntas
    async ClickBtnSiguiente() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#GostepFour").click();
    }

    //Captura cuestionario medico seccion 2
    //A. ¿Alguna solicitante está actualmente embarazada?
    async ClickCheckSiPA2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optSiExiste_20").click();
    }
    async ClickCheckNoPA2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optNoExiste_20").click();
    }
    //B. ¿Alguna solicitante ha estado embarazada? Indique el número de embarazos que ha tenido cualquier solicitante, incluidos partos naturales, abortos o cesáreas
    async ClickCheckSiPB2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optSiExiste_21").click();
    }
    async ClickCheckNoPB2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optNoExiste_21").click();
    }
    //C. ¿Alguna de las solicitantes ha presentado las siguientes condiciones o complicaciones? (Tratamientos de Fertilidad, Embarazo o el Parto, Múltiples embarazos, Hijos con una Enfermedad Congénita o Hereditaria)
    async ClickCheckSiPC2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optSiExiste_22").click();
    }
    async ClickCheckNoPC2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#optNoExiste_22").click();
    }
    //Terminan preguntas
    async ClickBtnSiguienteSeccion2() {
        await this.page.frameLocator('iframe#ifCotizador').locator("#GostepFive").click();
    }
}
