import {
  AseguradoDecision,
  SolicitudDecision,
} from "../../../types/ReglasSuscripcion";

export const FECHA_EVALUACION = new Date(2026, 7, 20);

export function fechaNacimiento(anios: number) {
  return new Date(
    FECHA_EVALUACION.getFullYear() - anios,
    FECHA_EVALUACION.getMonth(),
    FECHA_EVALUACION.getDate(),
  );
}

export function titular(
  cambios: Partial<AseguradoDecision> = {},
): AseguradoDecision {
  return {
    id: "titular-1",
    nombre: "Titular Prueba",
    tipo: "Titular",
    fechaNacimiento: fechaNacimiento(35),
    sexo: "Masculino",
    ...cambios,
  };
}

export function dependiente(
  cambios: Partial<AseguradoDecision> = {},
): AseguradoDecision {
  return {
    id: "dependiente-1",
    nombre: "Dependiente Prueba",
    tipo: "Dependiente",
    fechaNacimiento: fechaNacimiento(10),
    sexo: "Femenino",
    ...cambios,
  };
}

export function solicitud(
  cambios: Partial<SolicitudDecision> = {},
): SolicitudDecision {
  return {
    idioma: "Esp",
    fechaEvaluacion: FECHA_EVALUACION,
    asegurados: [titular()],
    respuestasMedicas: [],
    respuestasInformacionGeneral: [],
    archivosCoberturaPrevia: [],
    trazabilidad: {
      identificadorSolicitud: "SOL-HU-0001",
      origen: "WeeBroker",
      fechaActualizacion: new Date(2026, 7, 20, 10, 30),
    },
    ...cambios,
  };
}
