export type ResultadoIntentoAceptacionClaims =
  | "FechaVigenciaRequerida"
  | "AseguradosPendientes"
  | "AceptacionEnviada";

export type EstadoLimitacionClaims =
  | "PendienteUW"
  | "Rechazado"
  | "Autorizado"
  | "Desconocido";

export interface AseguradoLimitacionClaims {
  id: string;
  nombre: string;
  estado: EstadoLimitacionClaims;
  clases: string[];
}

export interface DetalleEstadoAseguradoClaims
  extends AseguradoLimitacionClaims {
  textoEstado: string;
  detalle: string;
}

export interface IntentoAceptacionClaims {
  resultado: ResultadoIntentoAceptacionClaims;
  mensaje: string;
}

export interface AutorizacionAseguradoClaims {
  id: string;
  nombre: string;
  estadoInicial: string;
  motivoEvaluacion: string;
  estadoFinal: EstadoLimitacionClaims;
}

export interface RechazoAseguradoClaims {
  id: string;
  nombre: string;
  motivo: string;
}

export interface ResultadoAceptacionEmisionClaims {
  idEjecucion: string;
  fechaHora: string;
  numeroPoliza: string;
  estado: "AceptacionEnviada" | "Error";
  fechaVigenciaAplicada?: string;
  intentosAceptacion: IntentoAceptacionClaims[];
  pendientesIniciales: string[];
  autorizados: AutorizacionAseguradoClaims[];
  rechazados: RechazoAseguradoClaims[];
  pendientesFinales: string[];
  incidencias: string[];
  error?: string;
}
