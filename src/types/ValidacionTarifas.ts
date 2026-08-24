import { TipoPolizaExcel } from './EscenarioExcel';

export interface OpcionPaisResidencia {
  valor: string;
  texto: string;
}

export type EstadoValidacionTarifa =
  | 'Exitosa'
  | 'SinTarifa'
  | 'EvaluacionBMI'
  | 'Error';

export interface VarianteValidacionTarifa {
  escenario: string;
  perfilCotizacion: string;
  configuracionPlan: string;
  tipoPoliza: TipoPolizaExcel;
  composicionFamiliar: string;
  idioma: string;
  plan: string;
  red: string;
  deducible: string;
  frecuenciaPago: string;
}

export interface ResultadoValidacionTarifa {
  idCaso: string;
  fechaHora: string;
  duracionMs: number;
  pais: OpcionPaisResidencia;
  variante: VarianteValidacionTarifa;
  estado: EstadoValidacionTarifa;
  tarifaAplicable?: string;
  folioPoliza?: string;
  detalle?: string;
}

export interface ResumenPaisValidacionTarifa extends OpcionPaisResidencia {
  casosEsperados: number;
  casosEjecutados: number;
  exitosos: number;
  sinTarifa: number;
  evaluacionesBMI: number;
  errores: number;
  coberturaCompleta: boolean;
}

export interface ResumenValidacionTarifas {
  paisesCatalogo: number;
  variantesEsperadas: number;
  casosEsperados: number;
  casosEjecutados: number;
  exitosos: number;
  sinTarifa: number;
  evaluacionesBMI: number;
  errores: number;
  casosFaltantes: number;
  casosDuplicados: number;
  coberturaCompleta: boolean;
}
