import { IdiomaCotizacionExcel } from "./EscenarioExcel";

export type TipoAsegurado = "Titular" | "Dependiente";
export type SexoBiologico = "Masculino" | "Femenino";
export type UnidadPeso = "kg" | "lb";
export type UnidadEstatura = "cm" | "ft";
export type PreguntaMedica =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R";

export type ResultadoRangoAntropometrico = "DentroRango" | "FueraRango";
export type MetodoEvaluacionAntropometrica =
  | "BMIAdulto"
  | "BMIPediatrico"
  | "PercentilCrecimiento";

export interface MedidasAntropometricas {
  peso: number;
  unidadPeso: UnidadPeso;
  estatura: number;
  unidadEstatura: UnidadEstatura;
  /**
   * Resultado entregado por las tablas de rangos del cliente. Las HU no
   * incluyen los límites adultos ni las tablas percentiles pediátricas.
   */
  resultadoRango?: ResultadoRangoAntropometrico;
  percentilCrecimiento?: number;
}

export interface AseguradoDecision {
  id: string;
  nombre: string;
  tipo: TipoAsegurado;
  fechaNacimiento: Date;
  sexo: SexoBiologico;
  medidas?: MedidasAntropometricas;
}

export interface RespuestaMedicaDecision {
  aseguradoId: string;
  pregunta: PreguntaMedica;
  afirmativa: boolean;
  diagnosticos?: string[];
}

export interface RespuestaInformacionGeneralDecision {
  codigo: string;
  afirmativa: boolean;
  esPersonaPoliticamenteExpuesta?: boolean;
}

export interface TrazabilidadSolicitud {
  identificadorSolicitud: string;
  origen: "AplicacionEnLinea" | "WeeBroker";
  fechaActualizacion: Date;
}

export interface SolicitudDecision {
  idioma: IdiomaCotizacionExcel;
  fechaEvaluacion: Date;
  asegurados: AseguradoDecision[];
  respuestasMedicas?: RespuestaMedicaDecision[];
  respuestasInformacionGeneral?: RespuestaInformacionGeneralDecision[];
  archivosCoberturaPrevia?: string[];
  trazabilidad: TrazabilidadSolicitud;
}

export interface EdadExacta {
  anios: number;
  mesesTotales: number;
}

export interface ResultadoCalculoAntropometrico {
  metodo: MetodoEvaluacionAntropometrica;
  edad: EdadExacta;
  pesoKg: number;
  estaturaMetros: number;
  bmi?: number;
  percentilCrecimiento?: number;
  requiereTablaPercentiles: boolean;
  resultadoRango?: ResultadoRangoAntropometrico;
}

export type BandejaClaims = "Nuevas" | "Pendientes" | "Rechazadas";
export type TipoCorreoDecision =
  | "RequerimientosEdadAvanzada"
  | "DenegacionTitular"
  | "DenegacionDependientes";
export type MomentoCorreoDecision =
  | "DespuesInformacionGeneral"
  | "DespuesFirmasSolicitanteYConsultor";
export type FormularioMedico =
  | "Cancer"
  | "Diabetes"
  | "HipertensionArterial"
  | "EnfermedadesCardiacas";

export interface EventoCorreoDecision {
  tipo: TipoCorreoDecision;
  momento: MomentoCorreoDecision;
  idioma: IdiomaCotizacionExcel;
  destinatarioAseguradoId: string;
  aseguradosRelacionados: string[];
  registrarEnLog: true;
}

export interface RechazoDependienteDecision {
  aseguradoId: string;
  nombre: string;
  diagnosticos: string[];
  motivosClaims: string[];
}

export interface ResultadoDecisionSuscripcion {
  bloqueada: boolean;
  motivoBloqueo?: "EdadNoAsegurable";
  aseguradosBloqueados: string[];
  permiteGuardarYAvanzar: boolean;
  requiereRevisionUW: boolean;
  rechazadaCompleta: boolean;
  dependientesRechazados: RechazoDependienteDecision[];
  requiereRecalculoPrima: boolean;
  permiteCybersource: boolean;
  conservarDependientesRechazadosEnDeclaracionYPOA: boolean;
  bandejaClaims?: BandejaClaims;
  estadoWeeBroker?: string;
  motivosRevisionUW: string[];
  motivosRechazoClaims: string[];
  formulariosMedicos: FormularioMedico[];
  eventosCorreo: EventoCorreoDecision[];
  calculosAntropometricos: Record<string, ResultadoCalculoAntropometrico>;
  trazabilidad: TrazabilidadSolicitud;
}
