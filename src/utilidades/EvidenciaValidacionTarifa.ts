import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';
import {
  ComparacionTarifa,
  DatosTarifaVisible,
  OpcionPaisResidencia,
  PantallaTarifa,
  ValidacionTarifaPantalla,
} from '../types/ValidacionTarifas';
import {
  compararTarifa,
  EntradaCalculoTarifa,
  TarifaNoCoincideError,
  TarifaReferenciaNoDisponibleError,
} from './ValidarTarifaAF';
import { registrarInfo } from './LoggerPruebas';
import { TarifaNoDisponibleError } from './ExtraerTarifaVisible';

type EstadoReporteTarifa =
  | 'EnProgreso'
  | 'Exitosa'
  | 'Diferencia'
  | 'SinTarifa'
  | 'SinReferencia'
  | 'Error';

interface ErrorConReporteTarifa extends Error {
  reporteTarifaJson?: string;
}

interface MetadatosCotizacionTarifa {
  idEjecucion: string;
  numeroFlujo: number;
  inicio: string;
  fin?: string;
  escenario: {
    nombre: string;
    perfil: string;
    configuracionPlan: string;
    tipoPoliza: string;
    conyugePareja: string;
    hijosMenoresDe24: string;
    idioma: string;
    plan: string;
    red: string;
    deducible: string;
    frecuenciaPago: string;
    resultadoEsperado: string;
  };
  pais: OpcionPaisResidencia;
  edades: { titular: number; conyuge?: number };
}

const NOMBRES_PANTALLA: Record<PantallaTarifa, string> = {
  Cotizacion: 'Cotización',
  ResumenPlanesCotizados: 'Resumen de planes cotizados',
  ConfirmacionPlanPago: 'Confirmación de plan y pago',
  AplicacionCompleta: 'Aplicación completa',
  MetodoPago: 'Método de pago',
};

function detalleError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function clasificarError(error: unknown): Exclude<EstadoReporteTarifa, 'EnProgreso' | 'Exitosa'> {
  if (error instanceof TarifaNoCoincideError) {
    return 'Diferencia';
  }
  if (error instanceof TarifaReferenciaNoDisponibleError) {
    return 'SinReferencia';
  }
  if (error instanceof TarifaNoDisponibleError) {
    return 'SinTarifa';
  }
  return 'Error';
}

export function obtenerRutaReporteTarifa(error: unknown) {
  return error instanceof Error
    ? (error as ErrorConReporteTarifa).reporteTarifaJson
    : undefined;
}

export function adjuntarRutaReporteTarifa(error: unknown, ruta: string) {
  const errorNormalizado: ErrorConReporteTarifa =
    error instanceof Error ? (error as ErrorConReporteTarifa) : new Error(String(error));
  errorNormalizado.reporteTarifaJson = ruta;
  if (!errorNormalizado.message.includes(ruta)) {
    errorNormalizado.message = `${errorNormalizado.message} Evidencia JSON: ${ruta}`;
  }
  return errorNormalizado;
}

export function descripcionAnotacionTarifa(
  pantalla: PantallaTarifa,
  comparacion: ComparacionTarifa,
) {
  return (
    `${NOMBRES_PANTALLA[pantalla]} | catálogo ${comparacion.version} | ` +
    `${comparacion.moneda} ${comparacion.montoEsperado.toFixed(2)} esperado = ` +
    `${comparacion.moneda} ${comparacion.montoObtenido.toFixed(2)} mostrado | ` +
    `diferencia ${comparacion.diferencia.toFixed(2)}`
  );
}

function anotarValidacionExitosa(
  pantalla: PantallaTarifa,
  comparacion: ComparacionTarifa,
) {
  const descripcion = descripcionAnotacionTarifa(pantalla, comparacion);
  try {
    test.info().annotations.push({
      type: 'tarifa-validada',
      description: descripcion,
    });
  } catch {
    // El flow también puede reutilizarse fuera del runner de Playwright.
  }
  registrarInfo(`Tarifa validada: ${descripcion}`);
}

export class EvidenciaValidacionTarifa {
  readonly rutaReporteJson: string;
  private readonly entrada: EntradaCalculoTarifa;
  private readonly metadatos: MetadatosCotizacionTarifa;
  private readonly validaciones: ValidacionTarifaPantalla[] = [];
  private estado: EstadoReporteTarifa = 'EnProgreso';
  private resultadoFlujo?: string;
  private numeroPoliza?: string;
  private detalle?: string;

  private constructor(
    rutaReporteJson: string,
    entrada: EntradaCalculoTarifa,
    metadatos: MetadatosCotizacionTarifa,
  ) {
    this.rutaReporteJson = rutaReporteJson;
    this.entrada = entrada;
    this.metadatos = metadatos;
  }

  static async crear(
    entrada: EntradaCalculoTarifa,
    numeroFlujo: number,
    directorioBase = path.resolve(
      __dirname,
      '../../Evidencias/validacion-tarifas',
    ),
  ) {
    const inicio = new Date();
    const idEjecucion = [
      inicio.toISOString().replace(/[:.]/g, '-'),
      process.pid,
      `flujo-${String(numeroFlujo).padStart(4, '0')}`,
      randomUUID().slice(0, 8),
    ].join('-');
    const directorio = path.join(directorioBase, idEjecucion);
    const rutaReporteJson = path.join(
      directorio,
      `validacion-tarifa-flujo-${String(numeroFlujo).padStart(4, '0')}.json`,
    );
    const escenario = entrada.escenario;
    const metadatos: MetadatosCotizacionTarifa = {
      idEjecucion,
      numeroFlujo,
      inicio: inicio.toISOString(),
      escenario: {
        nombre: String(escenario.EscenarioPrueba ?? ''),
        perfil: String(escenario.PerfilCotizacion ?? ''),
        configuracionPlan: String(escenario.ConfiguracionPlan ?? ''),
        tipoPoliza: String(escenario.TipoPoliza ?? ''),
        conyugePareja: String(escenario.ConyugePareja ?? ''),
        hijosMenoresDe24: String(escenario.HijosMenoresDe24 ?? ''),
        idioma: String(escenario.IdiomaCotizacion ?? ''),
        plan: String(escenario.CotizarPlan ?? ''),
        red: String(escenario.RedProveedores ?? ''),
        deducible: String(escenario.Deducible ?? ''),
        frecuenciaPago: String(escenario.FrecuenciaPago ?? ''),
        resultadoEsperado: String(escenario.ResultadoEsperado ?? ''),
      },
      pais: entrada.pais,
      edades: {
        titular: entrada.edadTitular,
        conyuge: entrada.edadConyuge,
      },
    };

    await mkdir(directorio, { recursive: true });
    const evidencia = new EvidenciaValidacionTarifa(
      rutaReporteJson,
      entrada,
      metadatos,
    );
    await evidencia.guardar();
    registrarInfo(`Evidencia de tarifas iniciada: ${rutaReporteJson}`);
    return evidencia;
  }

  obtenerValidaciones() {
    return this.validaciones.map((validacion) => ({ ...validacion }));
  }

  async validar(
    pantalla: PantallaTarifa,
    tarifaVisible: DatosTarifaVisible,
  ): Promise<ComparacionTarifa> {
    const fechaHora = new Date().toISOString();
    let comparacion: ComparacionTarifa;

    try {
      comparacion = compararTarifa(this.entrada, tarifaVisible);
    } catch (error) {
      this.validaciones.push({
        pantalla,
        fechaHora,
        estado:
          error instanceof TarifaReferenciaNoDisponibleError
            ? 'SinReferencia'
            : 'Error',
        selector: tarifaVisible.selector,
        tarifaVisible,
        detalle: detalleError(error),
      });
      await this.guardar();
      throw error;
    }

    const registro: ValidacionTarifaPantalla = {
      pantalla,
      fechaHora,
      estado: comparacion.coincide ? 'Exitosa' : 'Diferencia',
      selector: tarifaVisible.selector,
      tarifaVisible,
      comparacion,
      detalle: comparacion.explicacion,
    };
    this.validaciones.push(registro);
    await this.guardar();

    if (!comparacion.coincide) {
      throw new TarifaNoCoincideError(comparacion);
    }

    anotarValidacionExitosa(pantalla, comparacion);
    return comparacion;
  }

  async finalizarExito(resultadoFlujo: string, numeroPoliza?: string) {
    this.estado = 'Exitosa';
    this.resultadoFlujo = resultadoFlujo;
    this.numeroPoliza = numeroPoliza;
    this.metadatos.fin = new Date().toISOString();
    await this.guardar();
    registrarInfo(`Evidencia de tarifas finalizada: ${this.rutaReporteJson}`);
  }

  async finalizarError(error: unknown) {
    this.estado = clasificarError(error);
    this.detalle = detalleError(error);
    this.metadatos.fin = new Date().toISOString();
    await this.guardar();
    registrarInfo(
      `Evidencia de tarifas finalizada con ${this.estado}: ${this.rutaReporteJson}`,
    );
  }

  private async guardar() {
    const reporte = {
      schemaVersion: 1,
      metadatos: this.metadatos,
      estado: this.estado,
      resultadoFlujo: this.resultadoFlujo,
      numeroPoliza: this.numeroPoliza,
      detalle: this.detalle,
      resumen: {
        pantallasValidadas: this.validaciones.length,
        exitosas: this.validaciones.filter(
          (validacion) => validacion.estado === 'Exitosa',
        ).length,
        diferencias: this.validaciones.filter(
          (validacion) => validacion.estado === 'Diferencia',
        ).length,
        sinReferencia: this.validaciones.filter(
          (validacion) => validacion.estado === 'SinReferencia',
        ).length,
        errores: this.validaciones.filter(
          (validacion) => validacion.estado === 'Error',
        ).length,
      },
      validaciones: this.validaciones,
    };
    await writeFile(
      this.rutaReporteJson,
      `${JSON.stringify(reporte, null, 2)}\n`,
      'utf8',
    );
  }
}
