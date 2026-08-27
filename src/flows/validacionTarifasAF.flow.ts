import { Page } from '@playwright/test';
import { EscenarioExcel } from '../types/EscenarioExcel';
import {
  EstadoValidacionTarifa,
  OpcionPaisResidencia,
  ResultadoValidacionTarifa,
} from '../types/ValidacionTarifas';
import { InicioCotizacionDatosPersonalesAFPage } from '../paginas/2inicioCotizacionDatosPersonalesAFPage';
import { TarifaNoDisponibleError } from '../paginas/4resumenCotizacionPage';
import { AplicacionEnEvaluacionBMIError } from '../paginas/12apliacionCompletaPage';
import {
  HomeAFFlow,
  InicioSesionAFFlow,
  IniciarCotizacionFlow,
} from './cotizadorAF.flow';
import { CotizacionAFBaseFlow } from './cotizacionAFBase.flow';
import { obtenerVarianteValidacionTarifa } from '../utilidades/GenerarMatrizValidacionTarifas';
import {
  TarifaNoCoincideError,
  TarifaReferenciaNoDisponibleError,
} from '../utilidades/ValidarTarifaAF';
import { obtenerRutaReporteTarifa } from '../utilidades/EvidenciaValidacionTarifa';

function detalleError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function clasificarError(error: unknown): EstadoValidacionTarifa {
  if (error instanceof TarifaNoCoincideError) {
    return 'Diferencia';
  }
  if (error instanceof TarifaReferenciaNoDisponibleError) {
    return 'SinReferencia';
  }
  if (error instanceof TarifaNoDisponibleError) {
    return 'SinTarifa';
  }
  if (error instanceof AplicacionEnEvaluacionBMIError) {
    return 'EvaluacionBMI';
  }
  return 'Error';
}

export class ValidacionTarifasAFFlow {
  constructor(private readonly page: Page) {}

  async obtenerCatalogoPaises(
    escenarioAcceso: EscenarioExcel,
  ): Promise<OpcionPaisResidencia[]> {
    const inicioSesion = new InicioSesionAFFlow(this.page);
    const home = new HomeAFFlow(this.page);
    const iniciarCotizacion = new IniciarCotizacionFlow(this.page);

    await inicioSesion.paginaInicio(escenarioAcceso.Url);
    await inicioSesion.iniciarSesionAF(
      escenarioAcceso.IdiomaCotizacion,
      escenarioAcceso.CorreoInicio,
      escenarioAcceso.Contrasena.toString(),
    );
    await home.homeAF(escenarioAcceso.IdiomaCotizacion);
    await iniciarCotizacion.iniciarCotizacion(
      escenarioAcceso.IdiomaCotizacion,
    );

    return new InicioCotizacionDatosPersonalesAFPage(
      this.page,
    ).obtenerPaisesResidenciaTitular();
  }

  async ejecutar(
    escenario: EscenarioExcel,
    pais: OpcionPaisResidencia,
    numeroFlujo: number,
  ): Promise<ResultadoValidacionTarifa> {
    const inicio = Date.now();
    const variante = obtenerVarianteValidacionTarifa(escenario);
    const datosBase = {
      idCaso: `${pais.valor}::${escenario.PerfilCotizacion}::${escenario.ConfiguracionPlan}::${escenario.IdiomaCotizacion}`,
      fechaHora: new Date().toISOString(),
      pais,
      variante,
    };

    if (
      escenario.ResultadoEsperado !== 'Emision' ||
      escenario.ObjetivoBMI !== 'Ninguno'
    ) {
      return {
        ...datosBase,
        duracionMs: Date.now() - inicio,
        estado: 'Error',
        detalle:
          'Validación de tarifas sólo admite escenarios de Emision con ObjetivoBMI=Ninguno',
      };
    }

    try {
      const resultado = await new CotizacionAFBaseFlow(this.page).ejecutar(
        escenario,
        numeroFlujo,
        {
          paisResidencia: pais,
          asegurarSinBMI: true,
          registrarLogPoliza: false,
        },
      );

      if (resultado.resultado !== 'Emision') {
        return {
          ...datosBase,
          duracionMs: Date.now() - inicio,
          estado: 'EvaluacionBMI',
          detalle: 'La cotización terminó en evaluación BMI',
        };
      }
      if (!resultado.tarifaAplicable) {
        throw new TarifaNoDisponibleError(
          'El recorrido terminó sin conservar la tarifa aplicable',
        );
      }

      return {
        ...datosBase,
        duracionMs: Date.now() - inicio,
        estado: 'Exitosa',
        tarifaAplicable: resultado.tarifaAplicable,
        validacionTarifa: resultado.validacionTarifa,
        validacionesTarifa: resultado.validacionesTarifa,
        reporteTarifaJson: resultado.reporteTarifaJson,
        folioPoliza: resultado.numeroPoliza,
      };
    } catch (error) {
      return {
        ...datosBase,
        duracionMs: Date.now() - inicio,
        estado: clasificarError(error),
        tarifaAplicable:
          error instanceof TarifaNoCoincideError
            ? error.comparacion.textoVisible
            : undefined,
        validacionTarifa:
          error instanceof TarifaNoCoincideError
            ? error.comparacion
            : undefined,
        reporteTarifaJson: obtenerRutaReporteTarifa(error),
        detalle: detalleError(error),
      };
    }
  }
}
