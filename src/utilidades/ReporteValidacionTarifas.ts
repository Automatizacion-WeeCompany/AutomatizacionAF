import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EscenarioExcel } from '../types/EscenarioExcel';
import {
  OpcionPaisResidencia,
  ResultadoValidacionTarifa,
  ResumenPaisValidacionTarifa,
  ResumenValidacionTarifas,
  VarianteValidacionTarifa,
} from '../types/ValidacionTarifas';
import { obtenerVarianteValidacionTarifa } from './GenerarMatrizValidacionTarifas';
import { registrarInfo } from './LoggerPruebas';

interface MetadatosReporteTarifas {
  idEjecucion: string;
  inicio: string;
  fin?: string;
  proyecto: string;
  worker: number;
  matriz: 'CatalogoPaises x EscenariosEmision';
  paises: OpcionPaisResidencia[];
  variantes: VarianteValidacionTarifa[];
}

interface ResumenVarianteValidacionTarifa {
  escenario: string;
  tipoPoliza: string;
  idioma: string;
  casosEsperados: number;
  casosEjecutados: number;
  exitosos: number;
  diferencias: number;
  sinTarifa: number;
  sinReferencia: number;
  evaluacionesBMI: number;
  errores: number;
  coberturaCompleta: boolean;
}

export interface RutasReporteValidacionTarifas {
  log: string;
  reporteJson: string;
  reporteCsv: string;
}

function nombreSeguro(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function idCaso(
  pais: OpcionPaisResidencia,
  variante: VarianteValidacionTarifa,
) {
  return `${pais.valor}::${variante.perfilCotizacion}::${variante.configuracionPlan}::${variante.idioma}`;
}

function escaparCsv(valor: unknown) {
  const texto = String(valor ?? '');
  return `"${texto.replace(/"/g, '""')}"`;
}

function contarEstado(
  resultados: ResultadoValidacionTarifa[],
  estado: ResultadoValidacionTarifa['estado'],
) {
  return resultados.filter((resultado) => resultado.estado === estado).length;
}

export class ReporteValidacionTarifas {
  readonly rutas: RutasReporteValidacionTarifas;
  private readonly resultados: ResultadoValidacionTarifa[] = [];
  private readonly metadatos: MetadatosReporteTarifas;

  private constructor(
    rutas: RutasReporteValidacionTarifas,
    metadatos: MetadatosReporteTarifas,
  ) {
    this.rutas = rutas;
    this.metadatos = metadatos;
  }

  static async crear(
    proyecto: string,
    worker: number,
    paises: OpcionPaisResidencia[],
    escenarios: EscenarioExcel[],
  ) {
    const inicio = new Date();
    const idEjecucion = `${inicio.toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
    const directorio = path.resolve(
      __dirname,
      '../../Evidencias/validacion-tarifas',
      idEjecucion,
    );
    const base = `validacion-tarifas-${nombreSeguro(proyecto)}-worker-${worker}`;
    const rutas = {
      log: path.join(directorio, `${base}.ndjson`),
      reporteJson: path.join(directorio, `${base}.json`),
      reporteCsv: path.join(directorio, `${base}.csv`),
    };
    const metadatos: MetadatosReporteTarifas = {
      idEjecucion,
      inicio: inicio.toISOString(),
      proyecto,
      worker,
      matriz: 'CatalogoPaises x EscenariosEmision',
      paises,
      variantes: escenarios.map(obtenerVarianteValidacionTarifa),
    };

    await mkdir(directorio, { recursive: true });
    await writeFile(rutas.log, '', 'utf8');
    await writeFile(
      rutas.reporteJson,
      `${JSON.stringify({ metadatos, estado: 'EnProgreso' }, null, 2)}\n`,
      'utf8',
    );

    registrarInfo(`Reporte de validación de tarifas iniciado: ${rutas.reporteJson}`);
    return new ReporteValidacionTarifas(rutas, metadatos);
  }

  async registrar(resultado: ResultadoValidacionTarifa) {
    this.resultados.push(resultado);
    await appendFile(this.rutas.log, `${JSON.stringify(resultado)}\n`, 'utf8');
  }

  private obtenerResumen(): ResumenValidacionTarifas {
    const casosEsperados = new Set(
      this.metadatos.paises.flatMap((pais) =>
        this.metadatos.variantes.map((variante) => idCaso(pais, variante)),
      ),
    );
    const ocurrencias = new Map<string, number>();
    for (const resultado of this.resultados) {
      ocurrencias.set(
        resultado.idCaso,
        (ocurrencias.get(resultado.idCaso) ?? 0) + 1,
      );
    }
    const casosEjecutadosUnicos = new Set(
      [...ocurrencias.keys()].filter((id) => casosEsperados.has(id)),
    );
    const casosDuplicados = [...ocurrencias.values()].reduce(
      (total, repeticiones) => total + Math.max(0, repeticiones - 1),
      0,
    );
    const casosFaltantes = [...casosEsperados].filter(
      (id) => !casosEjecutadosUnicos.has(id),
    ).length;
    const sinTarifa = contarEstado(this.resultados, 'SinTarifa');
    const diferencias = contarEstado(this.resultados, 'Diferencia');
    const sinReferencia = contarEstado(this.resultados, 'SinReferencia');
    const evaluacionesBMI = contarEstado(this.resultados, 'EvaluacionBMI');
    const errores = contarEstado(this.resultados, 'Error');
    const exitosos = contarEstado(this.resultados, 'Exitosa');

    return {
      paisesCatalogo: this.metadatos.paises.length,
      variantesEsperadas: this.metadatos.variantes.length,
      casosEsperados: casosEsperados.size,
      casosEjecutados: this.resultados.length,
      exitosos,
      diferencias,
      sinTarifa,
      sinReferencia,
      evaluacionesBMI,
      errores,
      casosFaltantes,
      casosDuplicados,
      coberturaCompleta:
        casosFaltantes === 0 &&
        casosDuplicados === 0 &&
        exitosos === casosEsperados.size &&
        diferencias === 0 &&
        sinTarifa === 0 &&
        sinReferencia === 0 &&
        evaluacionesBMI === 0 &&
        errores === 0,
    };
  }

  private obtenerResumenPaises(): ResumenPaisValidacionTarifa[] {
    return this.metadatos.paises.map((pais) => {
      const resultados = this.resultados.filter(
        (resultado) => resultado.pais.valor === pais.valor,
      );
      const exitosos = contarEstado(resultados, 'Exitosa');
      const sinTarifa = contarEstado(resultados, 'SinTarifa');
      const diferencias = contarEstado(resultados, 'Diferencia');
      const sinReferencia = contarEstado(resultados, 'SinReferencia');
      const evaluacionesBMI = contarEstado(resultados, 'EvaluacionBMI');
      const errores = contarEstado(resultados, 'Error');

      return {
        ...pais,
        casosEsperados: this.metadatos.variantes.length,
        casosEjecutados: resultados.length,
        exitosos,
        diferencias,
        sinTarifa,
        sinReferencia,
        evaluacionesBMI,
        errores,
        coberturaCompleta:
          resultados.length === this.metadatos.variantes.length &&
          exitosos === this.metadatos.variantes.length &&
          diferencias === 0 &&
          sinTarifa === 0 &&
          sinReferencia === 0 &&
          evaluacionesBMI === 0 &&
          errores === 0,
      };
    });
  }

  private obtenerResumenVariantes(): ResumenVarianteValidacionTarifa[] {
    return this.metadatos.variantes.map((variante) => {
      const resultados = this.resultados.filter(
        (resultado) =>
          resultado.variante.perfilCotizacion === variante.perfilCotizacion &&
          resultado.variante.configuracionPlan === variante.configuracionPlan &&
          resultado.variante.idioma === variante.idioma,
      );
      const exitosos = contarEstado(resultados, 'Exitosa');
      const sinTarifa = contarEstado(resultados, 'SinTarifa');
      const diferencias = contarEstado(resultados, 'Diferencia');
      const sinReferencia = contarEstado(resultados, 'SinReferencia');
      const evaluacionesBMI = contarEstado(resultados, 'EvaluacionBMI');
      const errores = contarEstado(resultados, 'Error');

      return {
        escenario: variante.escenario,
        tipoPoliza: variante.tipoPoliza,
        idioma: variante.idioma,
        casosEsperados: this.metadatos.paises.length,
        casosEjecutados: resultados.length,
        exitosos,
        diferencias,
        sinTarifa,
        sinReferencia,
        evaluacionesBMI,
        errores,
        coberturaCompleta:
          resultados.length === this.metadatos.paises.length &&
          exitosos === this.metadatos.paises.length &&
          diferencias === 0 &&
          sinTarifa === 0 &&
          sinReferencia === 0 &&
          evaluacionesBMI === 0 &&
          errores === 0,
      };
    });
  }

  private obtenerCsv() {
    const encabezados = [
      'FechaHora',
      'Pais',
      'ValorPais',
      'TipoPoliza',
      'ComposicionFamiliar',
      'Idioma',
      'Plan',
      'Red',
      'Deducible',
      'FrecuenciaPago',
      'Estado',
      'TarifaAplicable',
      'VersionTarifa',
      'MontoEsperado',
      'MontoObtenido',
      'Diferencia',
      'TarifaTitular',
      'TarifaConyuge',
      'TarifaDependientes',
      'MontoBase',
      'Recargo',
      'MontoRecargo',
      'Recibos',
      'ZonaAdultos',
      'ZonaDependientes',
      'ReporteTarifaJson',
      'FolioPoliza',
      'DuracionMs',
      'Escenario',
      'Detalle',
    ];
    const filas = this.resultados.map((resultado) =>
      [
        resultado.fechaHora,
        resultado.pais.texto,
        resultado.pais.valor,
        resultado.variante.tipoPoliza,
        resultado.variante.composicionFamiliar,
        resultado.variante.idioma,
        resultado.variante.plan,
        resultado.variante.red,
        resultado.variante.deducible,
        resultado.variante.frecuenciaPago,
        resultado.estado,
        resultado.tarifaAplicable,
        resultado.validacionTarifa?.version,
        resultado.validacionTarifa?.montoEsperado,
        resultado.validacionTarifa?.montoObtenido,
        resultado.validacionTarifa?.diferencia,
        resultado.validacionTarifa?.calculo.tarifaTitular,
        resultado.validacionTarifa?.calculo.tarifaConyuge,
        resultado.validacionTarifa?.calculo.tarifaDependientes,
        resultado.validacionTarifa?.calculo.montoBase,
        resultado.validacionTarifa?.calculo.recargo,
        resultado.validacionTarifa?.calculo.montoRecargo,
        resultado.validacionTarifa?.calculo.recibos,
        resultado.validacionTarifa?.calculo.zonaAdultos,
        resultado.validacionTarifa?.calculo.zonaDependientes,
        resultado.reporteTarifaJson,
        resultado.folioPoliza,
        resultado.duracionMs,
        resultado.variante.escenario,
        resultado.detalle,
      ]
        .map(escaparCsv)
        .join(','),
    );

    return `${encabezados.map(escaparCsv).join(',')}\n${filas.join('\n')}\n`;
  }

  async finalizar() {
    this.metadatos.fin = new Date().toISOString();
    const resumen = this.obtenerResumen();
    const reporte = {
      metadatos: this.metadatos,
      resumen,
      resumenPaises: this.obtenerResumenPaises(),
      resumenVariantes: this.obtenerResumenVariantes(),
      resultados: this.resultados,
    };

    await writeFile(
      this.rutas.reporteJson,
      `${JSON.stringify(reporte, null, 2)}\n`,
      'utf8',
    );
    await writeFile(this.rutas.reporteCsv, this.obtenerCsv(), 'utf8');
    registrarInfo(`Reporte de validación de tarifas finalizado: ${this.rutas.reporteJson}`);
    return resumen;
  }
}
