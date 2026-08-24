import {
  AseguradoDecision,
  EdadExacta,
  EventoCorreoDecision,
  FormularioMedico,
  MedidasAntropometricas,
  MetodoEvaluacionAntropometrica,
  PreguntaMedica,
  RespuestaMedicaDecision,
  ResultadoCalculoAntropometrico,
  ResultadoDecisionSuscripcion,
  SolicitudDecision,
} from "../types/ReglasSuscripcion";

export const DIAGNOSTICOS_CRITICOS_POR_PREGUNTA = Object.freeze({
  C: ["Retraso mental", "Parálisis cerebral"],
  D: ["Psicosis", "Esquizofrenia"],
  F: ["Diabetes Tipo 1"],
  G: ["Insuficiencia cardíaca"],
  I: ["Hemofilia", "Lupus", "Esclerosis", "Inmunodeficiencia"],
  K: ["Cirrosis", "Pancreatitis crónica"],
  L: ["Insuficiencia renal crónica"],
  N: [
    "Síndrome de Down",
    "Síndrome de Turner",
    "Microcefalia",
    "Distrofia muscular",
  ],
} satisfies Partial<Record<PreguntaMedica, readonly string[]>>);

export const PREGUNTAS_UW_SIN_EXCEPCION = Object.freeze([
  "A",
  "B",
  "E",
  "H",
  "J",
  "M",
  "O",
  "P",
  "Q",
  "R",
] satisfies PreguntaMedica[]);

const ESTADOS_UW = Object.freeze({
  Esp: "En Suscripción",
  Eng: "In Underwriting",
  Port: "Em Subscrição",
});

const ESTADOS_RECHAZO = Object.freeze({
  Esp: "Declaración rechazada",
  Eng: "Rejected Declaration",
  Port: "Declaração rejeitada",
});

function normalizarTexto(valor: string) {
  return valor
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function redondear(valor: number, decimales: number) {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

function validarFecha(fecha: Date, nombre: string) {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    throw new Error(`${nombre} debe ser una fecha válida`);
  }
}

export function calcularEdadExacta(
  fechaNacimiento: Date,
  fechaEvaluacion: Date,
): EdadExacta {
  validarFecha(fechaNacimiento, "fechaNacimiento");
  validarFecha(fechaEvaluacion, "fechaEvaluacion");
  if (fechaNacimiento.getTime() > fechaEvaluacion.getTime()) {
    throw new Error("La fecha de nacimiento no puede ser futura");
  }

  let mesesTotales =
    (fechaEvaluacion.getFullYear() - fechaNacimiento.getFullYear()) * 12 +
    fechaEvaluacion.getMonth() -
    fechaNacimiento.getMonth();
  if (fechaEvaluacion.getDate() < fechaNacimiento.getDate()) {
    mesesTotales--;
  }

  return {
    anios: Math.floor(mesesTotales / 12),
    mesesTotales,
  };
}

function convertirPesoAKg(medidas: MedidasAntropometricas) {
  if (!Number.isFinite(medidas.peso) || medidas.peso <= 0) {
    throw new Error("El peso debe ser mayor que cero");
  }
  return medidas.unidadPeso === "lb"
    ? medidas.peso * 0.4536
    : medidas.peso;
}

function convertirEstaturaAMetros(medidas: MedidasAntropometricas) {
  if (!Number.isFinite(medidas.estatura) || medidas.estatura <= 0) {
    throw new Error("La estatura debe ser mayor que cero");
  }
  return medidas.unidadEstatura === "ft"
    ? (medidas.estatura * 30.48) / 100
    : medidas.estatura / 100;
}

function obtenerMetodoAntropometrico(edad: EdadExacta): MetodoEvaluacionAntropometrica {
  if (edad.mesesTotales < 24) {
    return "PercentilCrecimiento";
  }
  if (edad.anios <= 17) {
    return "BMIPediatrico";
  }
  return "BMIAdulto";
}

export function calcularEvaluacionAntropometrica(
  asegurado: AseguradoDecision,
  fechaEvaluacion: Date,
): ResultadoCalculoAntropometrico | undefined {
  if (!asegurado.medidas) {
    return undefined;
  }

  const edad = calcularEdadExacta(asegurado.fechaNacimiento, fechaEvaluacion);
  const pesoKg = convertirPesoAKg(asegurado.medidas);
  const estaturaMetros = convertirEstaturaAMetros(asegurado.medidas);
  const metodo = obtenerMetodoAntropometrico(edad);
  const base = {
    metodo,
    edad,
    pesoKg: redondear(pesoKg, 4),
    estaturaMetros: redondear(estaturaMetros, 4),
    resultadoRango: asegurado.medidas.resultadoRango,
  };

  if (metodo === "PercentilCrecimiento") {
    return {
      ...base,
      percentilCrecimiento: asegurado.medidas.percentilCrecimiento,
      requiereTablaPercentiles:
        asegurado.medidas.percentilCrecimiento === undefined,
    };
  }

  return {
    ...base,
    bmi: redondear(pesoKg / estaturaMetros ** 2, 2),
    requiereTablaPercentiles: metodo === "BMIPediatrico",
  };
}

function buscarTitular(asegurados: AseguradoDecision[]) {
  const titulares = asegurados.filter(({ tipo }) => tipo === "Titular");
  if (titulares.length !== 1) {
    throw new Error(
      `La solicitud debe contener exactamente un titular; encontrados: ${titulares.length}`,
    );
  }
  return titulares[0];
}

function diagnosticosCriticos(respuesta: RespuestaMedicaDecision) {
  const catalogo =
    DIAGNOSTICOS_CRITICOS_POR_PREGUNTA[
      respuesta.pregunta as keyof typeof DIAGNOSTICOS_CRITICOS_POR_PREGUNTA
    ] ?? [];
  const catalogoNormalizado = new Set(catalogo.map(normalizarTexto));
  return (respuesta.diagnosticos ?? []).filter((diagnostico) =>
    catalogoNormalizado.has(normalizarTexto(diagnostico)),
  );
}

function agregarUnico<T>(destino: T[], valor: T) {
  if (!destino.includes(valor)) {
    destino.push(valor);
  }
}

function obtenerFormularios(respuesta: RespuestaMedicaDecision) {
  const formularios: FormularioMedico[] = [];
  const diagnosticos = new Set(
    (respuesta.diagnosticos ?? []).map(normalizarTexto),
  );

  if (respuesta.pregunta === "A") {
    formularios.push("Cancer");
  }
  if (
    respuesta.pregunta === "F" &&
    diagnosticos.has(normalizarTexto("Diabetes Tipo 2"))
  ) {
    formularios.push("Diabetes");
  }
  if (
    respuesta.pregunta === "G" &&
    diagnosticos.has(normalizarTexto("Hipertensión Arterial"))
  ) {
    formularios.push("HipertensionArterial");
  }
  if (
    respuesta.pregunta === "G" &&
    [
      "Valvulopatía cardíaca",
      "Obstrucción arterial o infarto de miocardio",
      "Embolia",
      "Arritmias",
      "Cualquier otro trastorno cardiovascular",
    ].some((diagnostico) => diagnosticos.has(normalizarTexto(diagnostico)))
  ) {
    formularios.push("EnfermedadesCardiacas");
  }
  return formularios;
}

function crearCorreoEdad(
  solicitud: SolicitudDecision,
  titular: AseguradoDecision,
  asegurados: string[],
): EventoCorreoDecision {
  return {
    tipo: "RequerimientosEdadAvanzada",
    momento: "DespuesInformacionGeneral",
    idioma: solicitud.idioma,
    destinatarioAseguradoId: titular.id,
    aseguradosRelacionados: asegurados,
    registrarEnLog: true,
  };
}

export function evaluarSolicitud(
  solicitud: SolicitudDecision,
): ResultadoDecisionSuscripcion {
  validarFecha(solicitud.fechaEvaluacion, "fechaEvaluacion");
  validarFecha(
    solicitud.trazabilidad.fechaActualizacion,
    "trazabilidad.fechaActualizacion",
  );
  const titular = buscarTitular(solicitud.asegurados);
  const aseguradosPorId = new Map(
    solicitud.asegurados.map((asegurado) => [asegurado.id, asegurado]),
  );
  if (aseguradosPorId.size !== solicitud.asegurados.length) {
    throw new Error("Los identificadores de asegurado deben ser únicos");
  }

  const calculosAntropometricos: Record<string, ResultadoCalculoAntropometrico> = {};
  const aseguradosBloqueados: string[] = [];
  const aseguradosEdadAvanzada: string[] = [];
  const motivosRevisionUW: string[] = [];
  const motivosRechazoClaims: string[] = [];
  const formulariosMedicos: FormularioMedico[] = [];
  const eventosCorreo: EventoCorreoDecision[] = [];

  for (const asegurado of solicitud.asegurados) {
    const edad = calcularEdadExacta(
      asegurado.fechaNacimiento,
      solicitud.fechaEvaluacion,
    );
    if (edad.anios >= 77) {
      aseguradosBloqueados.push(asegurado.id);
      continue;
    }
    if (edad.anios >= 64) {
      aseguradosEdadAvanzada.push(asegurado.id);
      motivosRevisionUW.push(
        `Edad avanzada: ${asegurado.nombre} (${edad.anios} años)`,
      );
    }

    const calculo = calcularEvaluacionAntropometrica(
      asegurado,
      solicitud.fechaEvaluacion,
    );
    if (calculo) {
      calculosAntropometricos[asegurado.id] = calculo;
      if (calculo.resultadoRango === "FueraRango") {
        motivosRevisionUW.push(
          `${calculo.metodo} fuera de rango: ${asegurado.nombre}`,
        );
      }
    }
  }

  if (aseguradosBloqueados.length > 0) {
    return {
      bloqueada: true,
      motivoBloqueo: "EdadNoAsegurable",
      aseguradosBloqueados,
      permiteGuardarYAvanzar: false,
      requiereRevisionUW: false,
      rechazadaCompleta: false,
      dependientesRechazados: [],
      requiereRecalculoPrima: false,
      permiteCybersource: false,
      conservarDependientesRechazadosEnDeclaracionYPOA: false,
      motivosRevisionUW: [],
      motivosRechazoClaims: [],
      formulariosMedicos: [],
      eventosCorreo: [],
      calculosAntropometricos,
      trazabilidad: { ...solicitud.trazabilidad },
    };
  }

  if (aseguradosEdadAvanzada.length > 0) {
    eventosCorreo.push(
      crearCorreoEdad(solicitud, titular, aseguradosEdadAvanzada),
    );
  }

  const rechazosPorDependiente = new Map<
    string,
    { asegurado: AseguradoDecision; diagnosticos: string[] }
  >();
  let rechazoTitular = false;

  for (const respuesta of solicitud.respuestasMedicas ?? []) {
    if (!respuesta.afirmativa) {
      continue;
    }
    const asegurado = aseguradosPorId.get(respuesta.aseguradoId);
    if (!asegurado) {
      throw new Error(
        `La respuesta médica referencia un asegurado inexistente: ${respuesta.aseguradoId}`,
      );
    }

    const criticos = diagnosticosCriticos(respuesta);
    if (criticos.length > 0) {
      for (const diagnostico of criticos) {
        const motivo = `Rechazo por diagnóstico – condición crítica (${diagnostico})`;
        motivosRechazoClaims.push(`${asegurado.nombre}: ${motivo}`);
      }
      if (asegurado.tipo === "Titular") {
        rechazoTitular = true;
      } else {
        const existente = rechazosPorDependiente.get(asegurado.id) ?? {
          asegurado,
          diagnosticos: [],
        };
        for (const diagnostico of criticos) {
          agregarUnico(existente.diagnosticos, diagnostico);
        }
        rechazosPorDependiente.set(asegurado.id, existente);
      }
      motivosRevisionUW.push(
        `Diagnóstico con restricción médica: ${asegurado.nombre}`,
      );
    } else {
      motivosRevisionUW.push(
        `Respuesta médica afirmativa ${respuesta.pregunta}: ${asegurado.nombre}`,
      );
    }

    for (const formulario of obtenerFormularios(respuesta)) {
      agregarUnico(formulariosMedicos, formulario);
    }
  }

  const respuestasGeneralesUW = (
    solicitud.respuestasInformacionGeneral ?? []
  ).filter(
    ({ codigo, afirmativa, esPersonaPoliticamenteExpuesta }) => {
      const codigoNormalizado = normalizarTexto(codigo);
      const esPEP =
        esPersonaPoliticamenteExpuesta === true ||
        (codigoNormalizado.includes("politicamente") &&
          codigoNormalizado.includes("expuesta"));
      return afirmativa && !esPEP;
    },
  );
  for (const respuesta of respuestasGeneralesUW) {
    motivosRevisionUW.push(
      `Respuesta afirmativa en información general: ${respuesta.codigo}`,
    );
  }

  if (
    (solicitud.archivosCoberturaPrevia ?? []).some(
      (archivo) => archivo.trim().length > 0,
    )
  ) {
    motivosRevisionUW.push("Archivo de Cobertura de Seguro Previo");
  }

  const dependientesRechazados = rechazoTitular
    ? []
    : [...rechazosPorDependiente.values()].map(
        ({ asegurado, diagnosticos }) => ({
          aseguradoId: asegurado.id,
          nombre: asegurado.nombre,
          diagnosticos,
          motivosClaims: diagnosticos.map(
            (diagnostico) =>
              `Rechazo por diagnóstico – condición crítica (${diagnostico})`,
          ),
        }),
      );

  if (rechazoTitular) {
    eventosCorreo.push({
      tipo: "DenegacionTitular",
      momento: "DespuesFirmasSolicitanteYConsultor",
      idioma: solicitud.idioma,
      destinatarioAseguradoId: titular.id,
      aseguradosRelacionados: [titular.id],
      registrarEnLog: true,
    });
  } else if (dependientesRechazados.length > 0) {
    eventosCorreo.push({
      tipo: "DenegacionDependientes",
      momento: "DespuesFirmasSolicitanteYConsultor",
      idioma: solicitud.idioma,
      destinatarioAseguradoId: titular.id,
      aseguradosRelacionados: dependientesRechazados.map(
        ({ aseguradoId }) => aseguradoId,
      ),
      registrarEnLog: true,
    });
  }

  const requiereRevisionUW = !rechazoTitular && motivosRevisionUW.length > 0;
  return {
    bloqueada: false,
    aseguradosBloqueados: [],
    permiteGuardarYAvanzar: true,
    requiereRevisionUW,
    rechazadaCompleta: rechazoTitular,
    dependientesRechazados,
    requiereRecalculoPrima: dependientesRechazados.length > 0,
    permiteCybersource: !rechazoTitular,
    conservarDependientesRechazadosEnDeclaracionYPOA:
      dependientesRechazados.length > 0,
    bandejaClaims: rechazoTitular
      ? "Rechazadas"
      : requiereRevisionUW
        ? "Nuevas"
        : "Pendientes",
    estadoWeeBroker: rechazoTitular
      ? ESTADOS_RECHAZO[solicitud.idioma]
      : requiereRevisionUW
        ? ESTADOS_UW[solicitud.idioma]
        : undefined,
    motivosRevisionUW: rechazoTitular ? [] : motivosRevisionUW,
    motivosRechazoClaims,
    formulariosMedicos,
    eventosCorreo,
    calculosAntropometricos,
    trazabilidad: { ...solicitud.trazabilidad },
  };
}
