import { Page } from "@playwright/test";
import { seleccionarOpcionAleatoriaDesdeLocator } from "src/utilidades/SelectAleatoreo";

export class agregarPersonaPT2Page {
  constructor(private readonly page: Page) {}

  async SiEligePersonaAfectadaPA() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_A");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPA() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_A");
    await campoFecha.fill(fechaFormateada);
  }
  async SiTipoTumorCancerPA() {
    const selectTumor = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectTipoTumor_A");
    await seleccionarOpcionAleatoriaDesdeLocator(selectTumor);
  }
  async SiCheckQuimioRadioPA() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#QuimioTerampiaRadioSi")
      .click();
  }
  async NoCheckQuimioRadioPA() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="QuimioTerampiaRadioNo"]')
      .first()
      .click();
  }
  async SiOtroTipoCancerPA() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#addPersonaSeguroExistente_1")
      .click();
  }
  async BtnAgregarPA() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_A")
      .click();
  }
  //Segunda B
  async SiEligePersonaAfectadaPB() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_B");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaCirugiaPB() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepikerFechaCirugia_B");
    await campoFecha.fill(fechaFormateada);
  }
  async DiagnosticoProceMedPB(diagnostico: string) {
    const campoDiagnostico = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#DiagnosticoProcedimiento_B");
    await campoDiagnostico.fill(diagnostico);
  }
  async SiTratamientoActualPB() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="TratamientoActualSecuelaRadioSi"]')
      .click();
  }
  async NoTratamientoActualPB() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="TratamientoActualSecuelaRadioNo"]')
      .first()
      .click();
  }
  async CondicionActualPB(condicion: string) {
    const campoCondicion = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_B");
    await campoCondicion.fill(condicion);
  }
  async agregarOtroDiagnosticoPB() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#addPersonaSeguroExistente_2")
      .click();
  }
  async BtnAgregarPB() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_B")
      .click();
  }

  //Tercera C

  async SiEligePersonaAfectadaPC() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_C");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPC() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_C");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPC() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_C");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiTratamientoMedPC() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_C")
      .fill("tratamiento");
  }
  async SiCondicionActPC() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_C")
      .fill("condición actual");
  }
  async BtnAgregarPC() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_C")
      .click();
  }
  // Cuarta D
  async SiEligePersonaAfectadaPD() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_D");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPD() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_D");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPD() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_D");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiSintomasPD() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_D")
      .fill("Sintomas");
  }
  async SiTratamientosPD() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_D")
      .fill("Tratamiento");
  }
  async SiCondicionPD() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_D")
      .fill("Condicion");
  }
  async BtnAgregarPD() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_D")
      .click();
  }

  //Quinta E
  async SiEligePersonaAfectadaPE() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_E");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPE() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_E");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_E")
      .fill("Diagnostico");
  }
  async SiSintomasPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_E")
      .fill("Sintomas");
  }
  async SiTratamientosPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_E")
      .fill("Tratamiento");
  }
  async SiCondicionPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_E")
      .fill("Condicion");
  }
  async BtnAgregarPE() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_E")
      .click();
  }

  //sexta F
  async SiEligePersonaAfectadaPF() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_F");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiDiagnosticoPF() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_F");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiTratamientosPF() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_F")
      .fill("Tratamiento");
  }
  async SiCondicionPF() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_F")
      .fill("Condicion");
  }
  async SiFechaDiagnosticoPF() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_F");
    await campoFecha.fill(fechaFormateada);
  }
  async BtnAgregarPF() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_F")
      .click();
  }

  //Septima G
  async SiEligePersonaAfectadaPG() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_G");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiDiagnosticoPG() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_G");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiTratamientosPG() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_G")
      .fill("Tratamiento");
  }
  async SiFechaDiagnosticoPG() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_G");
    await campoFecha.fill(fechaFormateada);
  }
  async BtnAgregarPG() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_G")
      .click();
  }

  //Octava H
  async SiEligePersonaAfectadaPH() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_H");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPH() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_H");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_H")
      .fill("Diagnostico");
  }
  async SiSintomasPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_H")
      .fill("Sintomas");
  }
  async SiTratamientosPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamietoMedico_H")
      .fill("Tratamiento");
  }
  async SiCondicionPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_H")
      .fill("Condicion");
  }
  async BtnAgregarPH() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_H")
      .click();
  }

  //Novena I
  async SiEligePersonaAfectadaPI() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_I");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPI() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_I");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPI() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_I");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiCondicionPI() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_I")
      .fill("Condicion");
  }
  async BtnAgregarPI() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_I")
      .click();
  }

  //DECIMA J
  async SiEligePersonaAfectadaPJ() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_J");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPJ() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_J");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_J")
      .fill("Diagnostico");
  }
  async SiAreaAfectadaCuerpoPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#areaAfectadaCuerpo_J")
      .fill("Area del cuerpo afectada");
  }
  async SiSintomasPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_J")
      .fill("Sintomas");
  }
  async SiCheckSecuelaPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="TratamientoActualSecuelaRadioSi_J"]')
      .first()
      .click();
  }
  async NoCheckSecuelaPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="TratamientoActualSecuelaRadioNo_J"]')
      .first()
      .click();
  }
  async SiCondicionPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_J")
      .fill("Condicion");
  }
  async BtnAgregarPJ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_J")
      .click();
  }

  //Onceava K
  async SiEligePersonaAfectadaPK() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_K");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPK() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_K");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPK() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_K");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiTratamientosPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_K")
      .fill("Tratamiento");
  }
  async SiCondicionPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_K")
      .fill("Condicion");
  }
  async SiEstudiosPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#estudiosRealizados_K")
      .fill("Estudios que se realizaron");
  }
  async SiFechaEstudiosPK() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#fecgaEstudiosRealizados_K");
    await campoFecha.fill(fechaFormateada);
  }
  async SiSintomasPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_K")
      .fill("Sintomas");
  }
  async BtnAgregarPK() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_K")
      .click();
  }

  //Doceava L
  async SiEligePersonaAfectadaPL() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_L");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPL() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_L");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPL() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_L");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiSintomasPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_L")
      .fill("Sintomas");
  }
  async SiTratamientosPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_L")
      .fill("Tratamiento");
  }
  async SiCondicionPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_L")
      .fill("Condicion");
  }
  async SiEstudiosPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#estudiosRealizados_L")
      .fill("Estudios que se realizaron");
  }
  async SiFechaEstudiosPL() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#fecgaEstudiosRealizados_L");
    await campoFecha.fill(fechaFormateada);
  }
  async BtnAgregarPL() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_L")
      .click();
  }

  //Treceava M
  async SiEligePersonaAfectadaPM() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_M");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPM() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_M");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPM() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_M")
      .fill("Diagnostico");
  }
  async SiTratamientosPM() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_M")
      .fill("Tratamiento");
  }
  async SiCondicionPM() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_M")
      .fill("Condicion");
  }
  async BtnAgregarPM() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_M")
      .click();
  }

  // Catorceava N
  async SiEligePersonaAfectadaPN() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_N");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaDiagnosticoPN() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_N");
    await campoFecha.fill(fechaFormateada);
  }
  async SiDiagnosticoPN() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#selectDiagnostico_N");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiSintomasPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_N")
      .fill("Sintomas");
  }
  async SiTratamientosPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_N")
      .fill("Tratamiento");
  }
  async SiCondicionPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_N")
      .fill("Condicion");
  }
  async SiEstudiosPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#estudiosRealizados_N")
      .fill("Estudios que se realizaron");
  }
  async SiFechaEstudiosPN() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const dia = String(hoy.getDate()).padStart(2, "0");
    const anio = hoy.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const campoFecha = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#fechaEstudiosRealizados_N");
    await campoFecha.fill(fechaFormateada);
  }
  async BtnAgregarPN() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_N")
      .click();
  }

  //Quinceava O
  async SiEligePersonaAfectadaPO() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_O");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiDiagnosticoPO() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_O")
      .fill("Diagnostico");
  }
  async SiCondicionPO() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_O")
      .fill("Condicion");
  }
  async BtnAgregarPO() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_O")
      .click();
  }

  // Diesiseisava P
  async SiEligePersonaAfectadaPP() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_P");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiFechaCondActPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#datepickerFechaDiagnostico_P")
      .fill("Condicion");
  }
  async SiDiagnosticoPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#diagnostico_P")
      .fill("Diagnostico");
  }
  async SiSintomasPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#sintomas_P")
      .fill("Sintomas");
  }
  async SiTratamientosPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_P")
      .fill("Tratamiento");
  }
  async BtnAgregarPP() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_P")
      .click();
  }

  //Diesisieteava Q
  async SiEligePersonaAfectadaPQ() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_Q");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiTratamientosPQ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#condicionActual_Q")
      .fill("Condicion y tratamiento");
  }
  async SiCausaTratamientoPQ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#CausaDiagnosticoRecibeTratamiento_Q")
      .fill("Causa del tratamiento");
  }
  async SiMedicamentoDosisPQ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#txtDescMedicamentoTiempo_Q")
      .fill("Listado de medicamentos");
  }
  async BtnAgregarPQ() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_Q")
      .click();
  }

  //Diesiochoava R
  async SiEligePersonaAfectadaPR() {
    const dropdown = this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#SelectQuestion_R");
    await seleccionarOpcionAleatoriaDesdeLocator(dropdown);
  }
  async SiSubiPesoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="preguntaPesoSubir"]')
      .first()
      .click();
  }
  async NoSubiPesoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="preguntaPesoBajar"]')
      .first()
      .click();
  }
  async SiPesoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#Peso_R")
      .fill("90");
  }
  async SiCausaPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#causaPeso_R")
      .fill("Estres y comida");
  }
  async SiRecibiTratamientoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="redicbioTratamientoSi"]')
      .first()
      .click();
  }
  async NoRecibiTratamientoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator('label[for="redicbioTratamientoNo"]')
      .first()
      .click();
  }
  async SiTratamientoRecibidoPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#tratamientoMedico_R")
      .fill("Dieta");
  }
  async BtnAgregarPR() {
    await this.page
      .frameLocator("iframe#ifCotizador")
      .locator("#AddQuestion_R")
      .click();
  }
}
