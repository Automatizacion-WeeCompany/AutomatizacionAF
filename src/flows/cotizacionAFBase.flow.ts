import { Page } from "@playwright/test";
import { guardarLogPoliza } from "../utilidades/LogPolizas";
import { EscenarioExcel } from "../types/EscenarioExcel";
import {
  ComparacionTarifa,
  OpcionPaisResidencia,
  ValidacionTarifaPantalla,
} from "../types/ValidacionTarifas";
import {
  ContextoDatosCotizacion,
  DatosCotizacionGuardados,
} from "../utilidades/ContextoDatosCotizacion";
import {
  HomeAFFlow,
  InicioSesionAFFlow,
  IniciarCotizacionFlow,
  PasoCincoInformacionPersonalFlow,
  PasoCuatroResumenCotizacionFlow,
  PasoDiezDeclaracionFlow,
  PasoDoceRegistrarInformacionPagoFlow,
  PasoNueveTerminosyCondicionesFlow,
  PasoOchoConfirmacionDePlanYPagoFlow,
  PasoOnceAplicacionCompletaFlow,
  PasoSeisCuestionarioMedicoFlow,
  PasoSieteCuestionarioMedicoFlow,
  PasoTreceMetodoPagoFlow,
  PasoTresCotizacionFlow,
  PasoDosPlanesFlow,
  PasoUnoDatosPersonalesFlow,
} from "./cotizadorAF.flow";
import {
  adjuntarRutaReporteTarifa,
  EvidenciaValidacionTarifa,
} from "../utilidades/EvidenciaValidacionTarifa";

export type ResultadoEjecucionCotizacion =
  | {
      resultado: "EvaluacionBMI";
      validacionTarifa: ComparacionTarifa;
      validacionesTarifa: ValidacionTarifaPantalla[];
      reporteTarifaJson: string;
    }
  | {
      resultado: "Emision";
      nombreTitular: string;
      numeroPoliza: string;
      tarifaAplicable: string;
      validacionTarifa: ComparacionTarifa;
      validacionesTarifa: ValidacionTarifaPantalla[];
      reporteTarifaJson: string;
      datosCotizacion: DatosCotizacionGuardados;
    };

export interface OpcionesEjecucionCotizacion {
  paisResidencia?: OpcionPaisResidencia;
  asegurarSinBMI?: boolean;
  registrarLogPoliza?: boolean;
}

export class CotizacionAFBaseFlow {
  private readonly inicioSesionAF: InicioSesionAFFlow;
  private readonly homeAF: HomeAFFlow;
  private readonly iniciarCotizacion: IniciarCotizacionFlow;
  private readonly pasoUnoDatosPersonales: PasoUnoDatosPersonalesFlow;
  private readonly pasoDosPlanes: PasoDosPlanesFlow;
  private readonly pasoTresCotizacion: PasoTresCotizacionFlow;
  private readonly pasoCuatroResumenCotizacion: PasoCuatroResumenCotizacionFlow;
  private readonly pasoCincoInformacionPersonal: PasoCincoInformacionPersonalFlow;
  private readonly pasoSeisCuestionarioMedico: PasoSeisCuestionarioMedicoFlow;
  private readonly pasoSieteCuestionarioMedico: PasoSieteCuestionarioMedicoFlow;
  private readonly pasoOchoConfirmacionDePlanYPago: PasoOchoConfirmacionDePlanYPagoFlow;
  private readonly pasoNueveTerminosyCondiciones: PasoNueveTerminosyCondicionesFlow;
  private readonly pasoDiezDeclaracion: PasoDiezDeclaracionFlow;
  private readonly pasoOnceAplicacionCompleta: PasoOnceAplicacionCompletaFlow;
  private readonly pasoDoceRegistrarInformacionPago: PasoDoceRegistrarInformacionPagoFlow;
  private readonly pasoTreceMetodoPago: PasoTreceMetodoPagoFlow;
  private readonly contextoDatosCotizacion: ContextoDatosCotizacion;

  constructor(page: Page) {
    this.inicioSesionAF = new InicioSesionAFFlow(page);
    this.homeAF = new HomeAFFlow(page);
    this.iniciarCotizacion = new IniciarCotizacionFlow(page);
    this.pasoUnoDatosPersonales = new PasoUnoDatosPersonalesFlow(page);
    this.pasoDosPlanes = new PasoDosPlanesFlow(page);
    this.pasoTresCotizacion = new PasoTresCotizacionFlow(page);
    this.pasoCuatroResumenCotizacion = new PasoCuatroResumenCotizacionFlow(page);
    this.pasoCincoInformacionPersonal = new PasoCincoInformacionPersonalFlow(page);
    this.pasoSeisCuestionarioMedico = new PasoSeisCuestionarioMedicoFlow(page);
    this.pasoSieteCuestionarioMedico = new PasoSieteCuestionarioMedicoFlow(page);
    this.pasoOchoConfirmacionDePlanYPago =
      new PasoOchoConfirmacionDePlanYPagoFlow(page);
    this.pasoNueveTerminosyCondiciones =
      new PasoNueveTerminosyCondicionesFlow(page);
    this.pasoDiezDeclaracion = new PasoDiezDeclaracionFlow(page);
    this.pasoOnceAplicacionCompleta = new PasoOnceAplicacionCompletaFlow(page);
    this.pasoDoceRegistrarInformacionPago =
      new PasoDoceRegistrarInformacionPagoFlow(page);
    this.pasoTreceMetodoPago = new PasoTreceMetodoPagoFlow(page);
    this.contextoDatosCotizacion = new ContextoDatosCotizacion(page);
  }

  async ejecutar(
    escenario: EscenarioExcel,
    numeroFlujo: number,
    opciones: OpcionesEjecucionCotizacion = {},
  ): Promise<ResultadoEjecucionCotizacion> {
    await this.contextoDatosCotizacion.preparar();
    await this.inicioSesionAF.paginaInicio(escenario.Url);
    await this.inicioSesionAF.iniciarSesionAF(
      escenario.IdiomaCotizacion,
      escenario.CorreoInicio,
      escenario.Contrasena.toString(),
    );
    await this.homeAF.homeAF(escenario.IdiomaCotizacion);
    await this.iniciarCotizacion.iniciarCotizacion(
      escenario.IdiomaCotizacion,
    );
    this.contextoDatosCotizacion.activar();

    const { edadTitular, edadConyuge, paisSeleccionado } =
      await this.pasoUnoDatosPersonales.CapturaDatosPersonales(
        escenario.TipoPoliza,
        escenario.ConyugePareja,
        String(escenario.HijosMenoresDe24 ?? ""),
        opciones.paisResidencia,
      );
    const evidenciaTarifa = await EvidenciaValidacionTarifa.crear(
      {
        escenario,
        pais: paisSeleccionado,
        edadTitular,
        edadConyuge,
      },
      numeroFlujo,
    );
    const validarTarifaEnPantalla = evidenciaTarifa.validar.bind(evidenciaTarifa);

    try {
      await this.pasoDosPlanes.seleccionarPlanes(
        escenario.IdiomaCotizacion,
        escenario.CotizarPlan,
        escenario.RedProveedores,
        escenario.Deducible,
        escenario.FrecuenciaPago,
      );
      const { tarifaAplicable, validacionTarifa } =
        await this.pasoTresCotizacion.resumenCotizacion({
          idiomaCotizacion: escenario.IdiomaCotizacion,
          validarTarifaEnPantalla,
        });
      await this.pasoCuatroResumenCotizacion.resumenPlanesCot(
        escenario.IdiomaCotizacion,
        validarTarifaEnPantalla,
      );
      await this.pasoCincoInformacionPersonal.informacionPersonal(
        escenario,
        edadTitular,
        numeroFlujo,
        edadConyuge,
      );
      await this.pasoSeisCuestionarioMedico.CapturarCuestionarioMedicoP1(
        escenario.IdiomaCotizacion,
        escenario.CuestionarioMedicoCaptura,
        escenario.P5Sustancia,
        escenario.SigueIngiriendo,
      );
      await this.pasoSieteCuestionarioMedico.CapturarCuestionarioMedicoP2(
        escenario.IdiomaCotizacion,
        escenario.CapturaPreguntasPt2,
      );
      await this.pasoOchoConfirmacionDePlanYPago.CapturarConfirmacionDePlanYPago(
        validarTarifaEnPantalla,
      );
      await this.pasoNueveTerminosyCondiciones.CapturarTerminosyCondiciones();
      await this.pasoDiezDeclaracion.CapturarDeclaracion();

      if (escenario.ResultadoEsperado === "EvaluacionBMI") {
        if (escenario.ObjetivoBMI !== "Titular") {
          throw new Error(
            `La evaluación BMI de ${escenario.ObjetivoBMI} pertenece al flujo adicional de dependientes`,
          );
        }
        await this.pasoOnceAplicacionCompleta.ValidarAplicacionEnEvaluacion(
          escenario.IdiomaCotizacion,
          validarTarifaEnPantalla,
        );
        await evidenciaTarifa.finalizarExito("EvaluacionBMI");
        return {
          resultado: "EvaluacionBMI",
          validacionTarifa,
          validacionesTarifa: evidenciaTarifa.obtenerValidaciones(),
          reporteTarifaJson: evidenciaTarifa.rutaReporteJson,
        };
      }

      if (escenario.ResultadoEsperado !== "Emision") {
        throw new Error(
          `Resultado esperado no soportado: ${escenario.ResultadoEsperado}`,
        );
      }

      if (opciones.asegurarSinBMI) {
        await this.pasoOnceAplicacionCompleta.ValidarDisponibleParaPagoSinBMI(
          escenario.IdiomaCotizacion,
        );
      }

      await this.pasoOnceAplicacionCompleta.CapturarAplicacionCompleta(
        validarTarifaEnPantalla,
      );
      await this.pasoDoceRegistrarInformacionPago.CapturarInformacionPago();
      const confirmacion = await this.pasoTreceMetodoPago.CapturarMetodoPago(
        escenario.IdiomaCotizacion,
        validarTarifaEnPantalla,
      );
      const datosCotizacion = await this.contextoDatosCotizacion.guardar(
        escenario,
        confirmacion,
      );
      if (opciones.registrarLogPoliza !== false) {
        await guardarLogPoliza({
          numeroFlujo,
          escenario: `${escenario.EscenarioPrueba} ${escenario.IdiomaCotizacion}`,
          nombre: confirmacion.nombreTitular,
          poliza: confirmacion.numeroPoliza,
        });
      }

      await evidenciaTarifa.finalizarExito(
        "Emision",
        confirmacion.numeroPoliza,
      );
      return {
        resultado: "Emision",
        nombreTitular: confirmacion.nombreTitular,
        numeroPoliza: confirmacion.numeroPoliza,
        tarifaAplicable,
        validacionTarifa,
        validacionesTarifa: evidenciaTarifa.obtenerValidaciones(),
        reporteTarifaJson: evidenciaTarifa.rutaReporteJson,
        datosCotizacion,
      };
    } catch (error) {
      await evidenciaTarifa.finalizarError(error);
      throw adjuntarRutaReporteTarifa(error, evidenciaTarifa.rutaReporteJson);
    }
  }
}
