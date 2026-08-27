import { TipoPolizaExcel } from './EscenarioExcel';

export interface OpcionPaisResidencia {
  valor: string;
  texto: string;
}

export type EstadoValidacionTarifa =
  | 'Exitosa'
  | 'Diferencia'
  | 'SinTarifa'
  | 'SinReferencia'
  | 'EvaluacionBMI'
  | 'Error';

export interface DatosTarifaVisible {
  texto: string;
  monto: number;
  valoresVisibles: string[];
  selector: string;
}

export interface CalculoTarifa {
  version: string;
  vigenteDesde: string;
  moneda: string;
  paisIso: string;
  zonaAdultos: string;
  zonaDependientes: string;
  plan: string;
  red: string;
  deducibleDentro: number;
  deducibleFuera: number;
  frecuencia: string;
  recargo: number;
  recibos: number;
  tarifaTitular: number;
  tarifaConyuge: number;
  tarifaDependientes: number;
  montoBase: number;
  montoRecargo: number;
  montoAnual: number;
  montoPorRecibo: number;
}

export interface ComparacionTarifa {
  version: string;
  vigenteDesde: string;
  moneda: string;
  montoEsperado: number;
  montoObtenido: number;
  diferencia: number;
  coincide: boolean;
  textoVisible: string;
  explicacion: string;
  calculo: CalculoTarifa;
}

export type PantallaTarifa =
  | 'Cotizacion'
  | 'ResumenPlanesCotizados'
  | 'ConfirmacionPlanPago'
  | 'AplicacionCompleta'
  | 'MetodoPago';

export type EstadoValidacionTarifaPantalla =
  | 'Exitosa'
  | 'Diferencia'
  | 'SinReferencia'
  | 'Error';

export interface ValidacionTarifaPantalla {
  pantalla: PantallaTarifa;
  fechaHora: string;
  estado: EstadoValidacionTarifaPantalla;
  selector: string;
  tarifaVisible: DatosTarifaVisible;
  comparacion?: ComparacionTarifa;
  detalle?: string;
}

export type ValidarTarifaEnPantalla = (
  pantalla: PantallaTarifa,
  tarifaVisible: DatosTarifaVisible,
) => Promise<ComparacionTarifa>;

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
  validacionTarifa?: ComparacionTarifa;
  validacionesTarifa?: ValidacionTarifaPantalla[];
  reporteTarifaJson?: string;
  folioPoliza?: string;
  detalle?: string;
}

export interface ResumenPaisValidacionTarifa extends OpcionPaisResidencia {
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

export interface ResumenValidacionTarifas {
  paisesCatalogo: number;
  variantesEsperadas: number;
  casosEsperados: number;
  casosEjecutados: number;
  exitosos: number;
  diferencias: number;
  sinTarifa: number;
  sinReferencia: number;
  evaluacionesBMI: number;
  errores: number;
  casosFaltantes: number;
  casosDuplicados: number;
  coberturaCompleta: boolean;
}
