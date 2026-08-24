import { randomUUID } from "node:crypto";
import { Page } from "@playwright/test";
import {
  CampoDetalleClaims,
  FilaDetalleClaims,
  PersonaClaims,
  PersonaDetalleClaims,
  RespuestaDetalladaClaims,
  SolicitudClaimsPage,
} from "../paginas/solicitudClaimsPage";
import {
  ComparacionCampo,
  ComparacionPestana,
  EstadoComparacion,
  ResultadoComparacionDatos,
  ResumenComparacion,
} from "../types/ComparacionDatos";
import {
  DatoCotizacionCapturado,
  DatosCotizacionGuardados,
} from "../utilidades/ContextoDatosCotizacion";
import { guardarLogComparacionDatos } from "../utilidades/LogComparacionesDatos";

export type ModoComparacion =
  | "texto"
  | "catalogo"
  | "archivo"
  | "fecha"
  | "telefono"
  | "numero"
  | "pais"
  | "contiene"
  | "nombre"
  | "plan";

interface GrupoDependienteEsperado {
  relacion: string;
  fuenteRelacion: string;
  campos: DatoCotizacionCapturado[];
}

interface CampoDetalleEsperado {
  campo: string;
  claves: string[];
  etiquetasClaims: string[];
  modo?: ModoComparacion;
}

interface PreguntaDetalladaEsperada {
  clavePersona: string;
  campos: CampoDetalleEsperado[];
}

interface ConstructorDisplayNames {
  new (
    locales: string[],
    opciones: { type: "region" },
  ): { of(codigo: string): string | undefined };
}

const RELACIONES_DEPENDIENTES: Record<string, string> = {
  optConyugue: "Cónyuge",
  optHijoBio: "Hijo Biológico",
  optLegalmente: "Hijo Adoptado Legalmente",
  optHijastro: "Hijastro",
  optCustodia: "Menor Bajo Custodia Legal",
};

const IDIOMAS_CLAIMS: Record<string, string> = {
  Esp: "Español",
  Eng: "Inglés",
  Port: "Portugués",
};

const DOCUMENTOS_CONTRATO_ESPERADOS = [
  "Aplicación",
  "POA",
  "Recibo de pago",
  "Carta de Bienvenida",
  "ID Card",
  "Certificado de Cobertura",
  "Beneficios y servicios adicionales",
  "Programa de Recompensas",
  "Declaración de seguro",
  "Declaración de póliza",
];

const PESTANAS_COMPARACION = [
  "Información General",
  "Coberturas de Seguro / Médicos tratantes",
  "Cuestionario",
  "Plan y Frecuencia de Pago",
  "Idioma",
  "Limitaciones",
  "Contrato",
] as const;

const DETALLES_COBERTURAS: Record<number, PreguntaDetalladaEsperada> = {
  1: {
    clavePersona: "SelectQuestion_1A",
    campos: [],
  },
  2: {
    clavePersona: "div_Select_QuestionTypeSecure*",
    campos: [
      {
        campo: "Tipo de seguro",
        claves: ["CheckUno*", "CheckDos*"],
        etiquetasClaims: ["Tipo de seguro"],
        modo: "catalogo",
      },
      {
        campo: "Continuará con el seguro",
        claves: ["CheckTres*", "CheckCuatro*"],
        etiquetasClaims: ["¿Continuará con el seguro?"],
        modo: "catalogo",
      },
      {
        campo: "Certificado de seguro",
        claves: ["inputCertificado_*"],
        etiquetasClaims: ["Certificados de seguro"],
        modo: "archivo",
      },
      {
        campo: "Recibo de pago del seguro",
        claves: ["inputRecibo_*"],
        etiquetasClaims: ["Recibos de pago del seguro"],
        modo: "archivo",
      },
    ],
  },
  3: {
    clavePersona: "div_Select_QuestionDependientesSeguro*",
    campos: [
      {
        campo: "Detalles del proceso",
        claves: ["inputInfoDetalle*"],
        etiquetasClaims: ["Detalles sobre el proceso que se realizó"],
      },
    ],
  },
  4: {
    clavePersona: "SelectQuestion_3C",
    campos: [
      {
        campo: "Antecedente médico familiar",
        claves: ["EnfermedadDolencia_3C"],
        etiquetasClaims: [
          "Relación del familiar con el solicitante o solicitantes afectados, tipo de enfermedad o afección médica y edad de inicio",
        ],
      },
    ],
  },
  5: {
    clavePersona: "SelectQuestion_S",
    campos: [
      {
        campo: "Tipo de sustancia",
        claves: ["selectSustancia_S"],
        etiquetasClaims: ["¿Qué tipo de sustancia a ingerido?"],
        modo: "catalogo",
      },
      {
        campo: "Actualmente continúa ingiriéndola",
        claves: ["preguntaIngiereSi", "preguntaIngiereNo"],
        etiquetasClaims: ["¿Actualmente sigue ingiriéndolo?"],
        modo: "catalogo",
      },
      {
        campo: "Detalles del hábito",
        claves: ["txtDetalleHabitos"],
        etiquetasClaims: ["Detalles"],
      },
    ],
  },
  6: {
    clavePersona: "div_Select_QuestionDependientesEspecialista*",
    campos: [
      {
        campo: "Nombre del médico o especialista",
        claves: ["idInputNombreEspecialista"],
        etiquetasClaims: ["Nombre del Médico o Especialista"],
      },
      {
        campo: "Teléfono del médico o especialista",
        claves: ["idInputTelefonoEspecialista"],
        etiquetasClaims: ["N.° de Teléfono Celular"],
        modo: "telefono",
      },
      {
        campo: "Especialidad",
        claves: ["idSelectEspecialidad"],
        etiquetasClaims: ["Especialidad"],
        modo: "catalogo",
      },
      {
        campo: "Motivo de la última consulta",
        claves: ["idInputMotivo"],
        etiquetasClaims: ["Motivo de la Última Consulta"],
      },
      {
        campo: "Fecha de la última consulta",
        claves: ["idFEchaUltimaConsulta"],
        etiquetasClaims: ["Fecha de la Última Consulta"],
        modo: "fecha",
      },
      {
        campo: "Tratamiento o medicamento recetado",
        claves: ["IdDetalleTratamiento"],
        etiquetasClaims: [
          "Describa el tratamiento administrado o medicamento recetado",
        ],
      },
    ],
  },
};

const DETALLES_CUESTIONARIO: Record<string, PreguntaDetalladaEsperada> = {
  A: {
    clavePersona: "SelectQuestion_A",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_A"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Tipo de tumor o cáncer", claves: ["selectTipoTumor_A"], etiquetasClaims: ["Tipo de tumor o Cáncer"], modo: "catalogo" },
      { campo: "Quimioterapia o radioterapia actual", claves: ["QuimioTerampiaRadioSi", "QuimioTerampiaRadioNo"], etiquetasClaims: ["¿Está usted actualmente recibiendo quimioterapia o radioterapia?"], modo: "catalogo" },
    ],
  },
  B: {
    clavePersona: "SelectQuestion_B",
    campos: [
      { campo: "Fecha de la cirugía", claves: ["datepikerFechaCirugia_B"], etiquetasClaims: ["Fecha de la cirugía"], modo: "fecha" },
      { campo: "Diagnóstico y procedimiento médico", claves: ["DiagnosticoProcedimiento_B"], etiquetasClaims: ["Diagnóstico y Procedimiento Médico"] },
      { campo: "Tratamiento actual o secuela", claves: ["TratamientoActualSecuelaRadioSi", "TratamientoActualSecuelaRadioNo"], etiquetasClaims: ["¿Algún tratamiento actual o secuela?"], modo: "catalogo" },
      { campo: "Condición actual", claves: ["condicionActual_B"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  C: {
    clavePersona: "SelectQuestion_C",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_C"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_C"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_C"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_C"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  D: {
    clavePersona: "SelectQuestion_D",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_D"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_D"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_D"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_D"], etiquetasClaims: ["Condición actual"] },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_D"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Descripción del diagnóstico", claves: ["selectDiagnostico_D"], etiquetasClaims: ["Descripción diagnóstico"], modo: "catalogo" },
    ],
  },
  E: {
    clavePersona: "SelectQuestion_E",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_E"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_E"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Diagnóstico", claves: ["diagnostico_E"], etiquetasClaims: ["Diagnóstico"] },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_E"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_E"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  F: {
    clavePersona: "SelectQuestion_F",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_F"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_F"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_F"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_F"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  G: {
    clavePersona: "SelectQuestion_G",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_G"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_G"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_G"], etiquetasClaims: ["Tratamiento Médico"] },
    ],
  },
  H: {
    clavePersona: "SelectQuestion_H",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_H"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_H"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Diagnóstico", claves: ["diagnostico_H"], etiquetasClaims: ["Diagnóstico"] },
      { campo: "Tratamiento médico", claves: ["tratamietoMedico_H"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_H"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  I: {
    clavePersona: "SelectQuestion_I",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_I"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_I"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Condición actual", claves: ["condicionActual_I"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  J: {
    clavePersona: "SelectQuestion_J",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_J"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["diagnostico_J"], etiquetasClaims: ["Diagnóstico"] },
      { campo: "Área afectada del cuerpo", claves: ["areaAfectadaCuerpo_J"], etiquetasClaims: ["Área afectada del cuerpo"] },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_J"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Tratamiento actual o secuela", claves: ["TratamientoActualSecuelaRadioSi_J", "TratamientoActualSecuelaRadioNo_J"], etiquetasClaims: ["¿Algún tratamiento actual o secuela?"], modo: "catalogo" },
      { campo: "Condición actual", claves: ["condicionActual_J"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  K: {
    clavePersona: "SelectQuestion_K",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_K"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_K"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Otro trastorno del sistema digestivo", claves: ["selectDiagnostico_K"], etiquetasClaims: ["Otro trastorno del sistema digestivo"], modo: "catalogo" },
      { campo: "Tratamiento médico", claves: ["tratamientoMedico_K"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_K"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Estudios realizados", claves: ["estudiosRealizados_K"], etiquetasClaims: ["Estudios realizados"] },
      { campo: "Fecha de los estudios", claves: ["fecgaEstudiosRealizados_K"], etiquetasClaims: ["Fecha de los estudios realizados"], modo: "fecha" },
      { campo: "Condición actual", claves: ["condicionActual_K"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  L: {
    clavePersona: "SelectQuestion_L",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_L"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_L"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Otro trastorno renal o urinario", claves: ["selectDiagnostico_L"], etiquetasClaims: ["Otro trastorno del riñón o del sistema urinario"], modo: "catalogo" },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_L"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Tratamiento médico", claves: ["tratamientoMedico_L"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_L"], etiquetasClaims: ["Condición actual"] },
      { campo: "Estudios realizados", claves: ["estudiosRealizados_L"], etiquetasClaims: ["Estudios realizados"] },
      { campo: "Fecha de los estudios", claves: ["fecgaEstudiosRealizados_L"], etiquetasClaims: ["Fecha de los estudios realizados"], modo: "fecha" },
    ],
  },
  M: {
    clavePersona: "SelectQuestion_M",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_M"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["diagnostico_M"], etiquetasClaims: ["Diagnóstico"] },
      { campo: "Tratamiento médico", claves: ["tratamientoMedico_M"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_M"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  N: {
    clavePersona: "SelectQuestion_N",
    campos: [
      { campo: "Fecha del diagnóstico", claves: ["datepickerFechaDiagnostico_N"], etiquetasClaims: ["Fecha del diagnóstico"], modo: "fecha" },
      { campo: "Diagnóstico", claves: ["selectDiagnostico_N"], etiquetasClaims: ["Diagnóstico"], modo: "catalogo" },
      { campo: "Otra malformación o trastorno hereditario", claves: ["selectDiagnostico_N"], etiquetasClaims: ["Otras malformaciones, mutaciones genéticas, trastornos congénitos o hereditarios"], modo: "catalogo" },
      { campo: "Síntomas, signos o trastornos", claves: ["sintomas_N"], etiquetasClaims: ["Síntomas, signos o trastornos"] },
      { campo: "Tratamiento médico", claves: ["tratamientoMedico_N"], etiquetasClaims: ["Tratamiento Médico"] },
      { campo: "Condición actual", claves: ["condicionActual_N"], etiquetasClaims: ["Condición actual"] },
      { campo: "Estudios realizados", claves: ["estudiosRealizados_N"], etiquetasClaims: ["Estudios realizados"] },
      { campo: "Fecha de los estudios", claves: ["fechaEstudiosRealizados_N"], etiquetasClaims: ["Fecha de los estudios realizados"], modo: "fecha" },
    ],
  },
  O: {
    clavePersona: "SelectQuestion_O",
    campos: [
      { campo: "Diagnóstico", claves: ["diagnostico_O"], etiquetasClaims: ["Diagnóstico"] },
      { campo: "Condición actual", claves: ["condicionActual_O"], etiquetasClaims: ["Condición actual"] },
    ],
  },
  P: {
    clavePersona: "SelectQuestion_P",
    campos: [
      { campo: "Fecha y condición actual", claves: ["datepickerFechaDiagnostico_P"], etiquetasClaims: ["Fecha y condición actual"] },
      { campo: "Diagnóstico final", claves: ["diagnostico_P"], etiquetasClaims: ["Diagnóstico Final"] },
      { campo: "Detalles de trastornos, síntomas o signos", claves: ["sintomas_P"], etiquetasClaims: ["Detalles de sus trastornos, síntomas o signos"] },
      { campo: "Tratamientos recibidos", claves: ["tratamientoMedico_P"], etiquetasClaims: ["Tratamientos recibidos"] },
    ],
  },
  Q: {
    clavePersona: "SelectQuestion_Q",
    campos: [
      { campo: "Causa y diagnóstico del tratamiento", claves: ["CausaDiagnosticoRecibeTratamiento_Q"], etiquetasClaims: ["Causa y Diagnóstico para recibir tratamiento"] },
      { campo: "Condición y tratamiento actual", claves: ["condicionActual_Q"], etiquetasClaims: ["Condición actual"] },
      { campo: "Medicamento, dosis y duración", claves: ["txtDescMedicamentoTiempo_Q"], etiquetasClaims: ["Descripción del medicamento, dosis y duración"] },
    ],
  },
  R: {
    clavePersona: "SelectQuestion_R",
    campos: [
      { campo: "Subió o perdió peso", claves: ["preguntaPesoSubir", "preguntaPesoBajar"], etiquetasClaims: ["¿Subiste o perdiste peso?"], modo: "catalogo" },
      { campo: "Peso", claves: ["Peso_R"], etiquetasClaims: ["Peso"], modo: "numero" },
      { campo: "Causa", claves: ["causaPeso_R"], etiquetasClaims: ["¿Cuál fue la causa?"] },
      { campo: "Recibió tratamiento", claves: ["redicbioTratamientoSi", "redicbioTratamientoNo"], etiquetasClaims: ["¿Recibió algún tratamiento?"], modo: "catalogo" },
      { campo: "Tratamiento recibido", claves: ["tratamientoMedico_R"], etiquetasClaims: ["¿Qué tratamiento recibió?"] },
    ],
  },
};

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function normalizarTelefono(valor: string) {
  return valor.replace(/\D/g, "");
}

function normalizarNumero(valor: string) {
  return valor.replace(/[^\d.-]/g, "");
}

function fechasLocalizadasEquivalentes(esperado: string, obtenido: string) {
  const partesEsperado = esperado.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const partesObtenido = obtenido.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  return Boolean(
    partesEsperado &&
      partesObtenido &&
      Number(partesEsperado[1]) === Number(partesObtenido[2]) &&
      Number(partesEsperado[2]) === Number(partesObtenido[1]) &&
      partesEsperado[3] === partesObtenido[3],
  );
}

function extensionesArchivoEquivalentes(esperado: string, obtenido: string) {
  const extensionEsperada = esperado.match(/\.([a-z0-9]+)$/i)?.[1];
  const extensionObtenida = obtenido.match(/\.([a-z0-9]+)$/i)?.[1];
  return Boolean(
    esperado.trim() &&
      obtenido.trim() &&
      extensionEsperada &&
      extensionObtenida &&
      extensionEsperada.toUpperCase() === extensionObtenida.toUpperCase(),
  );
}

const GRUPOS_EQUIVALENCIAS_CATALOGO = [
  ["SI", "YES", "SIM"],
  ["NO"],
  ["MASCULINO", "MALE", "HOMBRE"],
  ["FEMENINO", "FEMALE", "MUJER"],
  ["CASADO", "CASADO(A)", "MARRIED", "CASADO(A)"],
  ["SOLTERO", "SOLTERO(A)", "SINGLE", "SOLTEIRO(A)"],
  ["DIVORCIADO", "DIVORCIADO(A)", "DIVORCED", "DIVORCIADO(A)"],
  ["VIUDO", "VIUDO(A)", "WIDOWED", "VIUVO(A)"],
  [
    "ARTE/ENTRETENIMIENTO/MEDIOS",
    "ARTS/ENTERTAINMENT/MEDIA",
    "ARTES/ENTRETENIMENTO/MIDIA",
  ],
  ["ID DEL PAIS", "COUNTRY ID", "ID DO PAIS"],
  [
    "CONYUGE/PAREJA DOMESTICA",
    "CONYUGE",
    "SPOUSE/DOMESTIC PARTNER",
    "SPOUSE",
    "CONJUGE/PARCEIRO DOMESTICO",
    "CONJUGE",
  ],
  ["HIJO BIOLOGICO", "BIOLOGICAL CHILD", "FILHO BIOLOGICO"],
  ["HIJO ADOPTADO LEGALMENTE", "LEGALLY ADOPTED CHILD"],
  ["HIJASTRO", "STEPCHILD", "ENTEADO"],
  ["MENOR BAJO CUSTODIA LEGAL", "MINOR UNDER LEGAL GUARDIANSHIP"],
  ["TITULAR", "PRIMARY APLICANT", "PRIMARY APPLICANT", "POLICY HOLDER"],
  ["ANUAL", "ANNUAL"],
  ["SEMESTRAL", "SEMIANNUAL", "SEMI-ANNUAL"],
  ["TRIMESTRAL", "QUARTERLY"],
  ["MENSUAL", "MONTHLY"],
  ["ESPANOL", "SPANISH", "ESPANHOL"],
  ["INGLES", "ENGLISH"],
  ["PORTUGUES", "PORTUGUESE"],
  ["NACIONAL", "NATIONAL"],
  ["INTERNACIONAL", "INTERNATIONAL"],
  ["PRODUCTOS DE NICOTINA", "NICOTINE PRODUCTS"],
  ["CANCER DE PULMON", "LUNG CANCER"],
  ["CANCER DE ESTOMAGO", "STOMACH CANCER", "CANCER OF THE STOMACH"],
  ["PARALISIS CEREBRAL", "CEREBRAL PARALYSIS"],
  ["PSICOSIS", "PSYCHOSIS"],
  ["ANSIEDAD", "ANXIETY"],
  ["DIABETES TIPO 1", "DIABETES TYPE 1"],
  ["HIPERTENSION ARTERIAL", "ARTERIAL HYPERTENSION"],
  ["INMUNODEFICIENCIA", "IMMUNODEFICIENCY", "INMUNODEFICIENCY"],
  ["PANCREATITIS CRONICA", "CHRONIC PANCREATITIS"],
  ["NEFRITIS", "NEPHRITIS"],
  ["MICROCEFALIA", "MICROCEPHALY"],
  ["ANOMALIA DEL CEREBRO", "BRAIN ABNORMALITY"],
  ["ENFERMEDAD PITUITARIA", "PITUITARY DISEASE"],
  ["EMBOLISMO", "EMBOLISM"],
  ["INSUFICIENCIA RENAL CRONICA", "CHRONIC RENAL FAILURE"],
  ["PATOLOGIA CLINICA", "CLINICAL PATHOLOGY"],
  ["NEUROCIRUGIA", "NEUROSURGERY"],
  ["MEDICINA LEGAL Y FORENSE", "LEGAL AND FORENSIC MEDICINE"],
  ["EPIDEMIOLOGIA", "EPIDEMIOLOGY"],
  ["TRAUMATOLOGIA Y ORTOPEDIA", "TRAUMATOLOGY AND ORTHOPEDICS"],
  ["CANCER DE ESOFAGO", "ESOPHAGEAL CANCER"],
  ["CANCER DE UTERO", "UTERUS CANCER"],
  ["ACCIDENTE CEREBROVASCULAR", "STROKE"],
  ["MAREOS", "MAREO", "DIZZINESS"],
  ["DEPRESION", "DEPRESSION"],
  ["ENFERMEDAD TIROIDEA", "THYROID DISEASE"],
  ["ANEURISMA", "ANEURYSM"],
  [
    "ENFERMEDAD DE COAGULACION DE LA SANGRE",
    "BLOOD CLOTTING DISEASE",
    "BLOOD CLOTING DISEASE",
  ],
  ["HEMORRAGIA INTESTINAL", "INTESTINAL BLEEDING"],
  ["QUISTES RENALES", "RENAL CYSTS"],
  ["LUPUS ERITEMATOSO", "LUPUS ERYTHEMATOSUS"],
  ["HEMOFILIA", "HEMOPHILIA"],
  ["ULCERA", "ULCER"],
  ["SINDROME DE TURNER", "TURNER SYNDROME"],
  ["SINDROME DE DOWN", "DOWN SYNDROME"],
  ["PALADAR HENDIDO", "CLEFT PALATE"],
  [
    "OBSTRUCCION DE LAS ARTERIAS O ATAQUE AL CORAZON",
    "OBSTRUCTION OF ARTERIES OR HEART ATTACK",
  ],
  ["SUBI PESO", "GAINED WEIGHT", "WEIGHT GAIN"],
  ["PERDI PESO", "LOST WEIGHT", "WEIGHT LOSS"],
] as const;

const EQUIVALENCIAS_CATALOGO = new Map<string, string>();
for (const grupo of GRUPOS_EQUIVALENCIAS_CATALOGO) {
  const canonico = normalizarTexto(grupo[0]);
  for (const valor of grupo) {
    EQUIVALENCIAS_CATALOGO.set(normalizarTexto(valor), canonico);
  }
}

const CONECTORES_CATALOGO = new Set([
  "A",
  "AL",
  "AND",
  "DA",
  "DAS",
  "DE",
  "DEL",
  "DO",
  "DOS",
  "E",
  "EL",
  "LA",
  "LAS",
  "LOS",
  "OF",
  "THE",
  "Y",
]);

function normalizarValorCatalogo(valor: string) {
  const normalizado = normalizarTexto(valor);
  return EQUIVALENCIAS_CATALOGO.get(normalizado) ?? normalizado;
}

function contienenEquivalenciaCatalogo(esperado: string, obtenido: string) {
  const esperadoNormalizado = normalizarTexto(esperado);
  const obtenidoNormalizado = normalizarTexto(obtenido);

  return GRUPOS_EQUIVALENCIAS_CATALOGO.some((grupo) => {
    const alias = grupo.map(normalizarTexto);
    return (
      alias.some((valor) => esperadoNormalizado.includes(valor)) &&
      alias.some((valor) => obtenidoNormalizado.includes(valor))
    );
  });
}

function tokensCatalogo(valor: string) {
  return normalizarTexto(valor)
    .replace(/[^A-Z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token && !CONECTORES_CATALOGO.has(token));
}

function tienenCoincidenciaLexicaCatalogo(esperado: string, obtenido: string) {
  const esperados = new Set(tokensCatalogo(esperado));
  const obtenidos = new Set(tokensCatalogo(obtenido));
  const minimo = Math.min(esperados.size, obtenidos.size);

  // Evita aceptar pares ambiguos como GUINEA / GUINEA ECUATORIAL.
  if (minimo < 2) {
    return false;
  }

  const compartidos = [...esperados].filter((token) => obtenidos.has(token)).length;
  return compartidos >= 2 && compartidos / minimo >= 0.75;
}

function crearCatalogoPaises() {
  const catalogo = new Map<string, string>();
  const Constructor = (Intl as unknown as { DisplayNames?: ConstructorDisplayNames })
    .DisplayNames;

  const registrar = (nombre: string, codigo: string) => {
    const normalizado = normalizarTexto(nombre);
    catalogo.set(normalizado, codigo);

    // Intl usa con frecuencia "&" mientras los portales muestran AND, Y o E.
    const patronConector = /\s+(?:&|AND|Y|E)\s+/g;
    for (const conector of [" & ", " AND ", " Y ", " E "]) {
      catalogo.set(normalizado.replace(patronConector, conector), codigo);
    }
  };

  if (Constructor) {
    const idiomas = ["es", "en", "pt"].map(
      (idioma) => new Constructor([idioma], { type: "region" }),
    );

    for (let primera = 65; primera <= 90; primera++) {
      for (let segunda = 65; segunda <= 90; segunda++) {
        const codigo = `${String.fromCharCode(primera)}${String.fromCharCode(segunda)}`;
        for (const idioma of idiomas) {
          const nombre = idioma.of(codigo);
          if (nombre && nombre !== codigo) {
            registrar(nombre, codigo);
          }
        }
      }
    }
  }

  const alias: Record<string, string> = {
    "ESTADO PLURINACIONAL DE BOLIVIA": "BO",
    "BOLIVIA PLURINATIONAL STATE OF": "BO",
    "REPUBLICA BOLIVARIANA DE VENEZUELA": "VE",
    "VENEZUELA BOLIVARIAN REPUBLIC OF": "VE",
    "REPUBLICA ISLAMICA DE IRAN": "IR",
    "IRAN ISLAMIC REPUBLIC OF": "IR",
    "ISLAMIC REPUBLIC OF IRAN": "IR",
    "REPUBLICA ARABE SIRIA": "SY",
    "SYRIAN ARAB REPUBLIC": "SY",
    "REPUBLICA UNIDA DE TANZANIA": "TZ",
    "TANZANIA UNITED REPUBLIC OF": "TZ",
    "REPUBLICA DE MOLDOVA": "MD",
    "MOLDOVA REPUBLIC OF": "MD",
    "REPUBLICA DEMOCRATICA POPULAR LAO": "LA",
    "LAO PEOPLES DEMOCRATIC REPUBLIC": "LA",
    "FEDERACION DE RUSIA": "RU",
    "RUSSIAN FEDERATION": "RU",
    "VIET NAM": "VN",
    "BRUNEI DARUSSALAM": "BN",
    "MICRONESIA FEDERATED STATES OF": "FM",
    "PALESTINE STATE OF": "PS",
    "COTE DIVOIRE": "CI",
    "CABO VERDE": "CV",
    "SWAZILAND": "SZ",
    "TURKIYE": "TR",
    "SINT EUSTATIUS AND SABA BONAIRE": "BQ",
    "BONAIRE SINT EUSTATIUS AND SABA": "BQ",
    "SAN EUSTAQUIO Y SABA BONAIRE": "BQ",
    "UNITED STATES MINOR OUTLYING ISLANDS": "UM",
    "ISLAS ULTRAMARINAS MENORES DE ESTADOS UNIDOS": "UM",
    "REPUBLIC OF KOREA": "KR",
    "REPUBLICA DE COREA": "KR",
  };

  for (const [nombre, codigo] of Object.entries(alias)) {
    registrar(nombre, codigo);
  }

  return catalogo;
}

const CATALOGO_PAISES = crearCatalogoPaises();

function normalizarPais(valor: string) {
  const normalizado = normalizarTexto(valor);
  return CATALOGO_PAISES.get(normalizado) ?? normalizado;
}

function normalizarPlan(valor: string) {
  return normalizarTexto(valor).replace(/^AF HEALTH\s*\|\s*AF\s+/, "");
}

function obtenerResumen(comparaciones: ComparacionCampo[]): ResumenComparacion {
  return {
    total: comparaciones.length,
    coinciden: comparaciones.filter(({ estado }) => estado === "Coincide").length,
    coincidenciasParciales: comparaciones.filter(
      ({ estado }) => estado === "CoincidenciaParcial",
    ).length,
    diferentes: comparaciones.filter(({ estado }) => estado === "Diferente").length,
    noComparables: comparaciones.filter(
      ({ estado }) => estado === "NoComparable",
    ).length,
  };
}

function valorCampo(campo: DatoCotizacionCapturado | undefined) {
  if (!campo) {
    return undefined;
  }
  return campo.textoSeleccionado || campo.valor;
}

function valorVisibleSeleccion(
  campo: DatoCotizacionCapturado | undefined,
) {
  if (!campo) {
    return undefined;
  }

  const seleccionado = campo.textoSeleccionado?.trim();
  const esNombreTecnicoDeRadio =
    ["radio", "checkbox"].includes(campo.tipoControl) &&
    Boolean(seleccionado && /radio/i.test(seleccionado));

  return esNombreTecnicoDeRadio ? undefined : valorCampo(campo);
}

function campoEnGrupo(
  grupo: GrupoDependienteEsperado,
  clave: string,
) {
  const coincidencias = grupo.campos.filter((campo) => campo.clave === clave);
  return coincidencias[coincidencias.length - 1];
}

function claveNormalizada(valor: string) {
  return normalizarTexto(valor).replace(/[^A-Z0-9]/g, "");
}

function campoPersona(persona: PersonaClaims, etiqueta: string) {
  const buscada = claveNormalizada(etiqueta);
  const entrada = Object.entries(persona.campos).find(
    ([campo]) => claveNormalizada(campo) === buscada,
  );
  return entrada?.[1] ?? "";
}

function tokensNombre(valor: string) {
  return normalizarTexto(valor.replace(/\([^)]*\)/g, ""))
    .split(" ")
    .filter(Boolean)
    .sort();
}

function nombresEquivalentes(esperado: string, obtenido: string) {
  const tokensEsperados = tokensNombre(esperado);
  const tokensObtenidos = tokensNombre(obtenido);
  const compartidos = tokensEsperados.filter((token) =>
    tokensObtenidos.includes(token),
  );
  return (
    tokensEsperados.length > 0 &&
    tokensObtenidos.length > 0 &&
    compartidos.length >= Math.min(2, tokensEsperados.length, tokensObtenidos.length) &&
    (tokensEsperados.every((token) => tokensObtenidos.includes(token)) ||
      tokensObtenidos.every((token) => tokensEsperados.includes(token)) ||
      compartidos.length >= 2)
  );
}

function relacionEnTituloPersona(valor: string | undefined) {
  return valor?.match(/\(([^()]*)\)\s*$/)?.[1].trim();
}

function normalizarEtiquetaDetalle(valor: string) {
  return normalizarTexto(valor)
    .replace(/[¿?]/g, "")
    .replace(/\s+\d+$/, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function coincideEtiquetaDetalle(actual: string, esperadas: string[]) {
  const normalizada = normalizarEtiquetaDetalle(actual);
  return esperadas.some(
    (esperada) => normalizarEtiquetaDetalle(esperada) === normalizada,
  );
}

function campoEnFilaDetalle(
  fila: FilaDetalleClaims | undefined,
  etiquetas: string[],
) {
  if (!fila) {
    return { valor: "", documentos: [] as string[], etiqueta: etiquetas[0] };
  }

  const entrada = Object.entries(fila.campos).find(([etiqueta]) =>
    coincideEtiquetaDetalle(etiqueta, etiquetas),
  );
  const etiqueta = entrada?.[0] ?? etiquetas[0];
  return {
    etiqueta,
    valor: entrada?.[1] ?? "",
    documentos: fila.documentos[etiqueta] ?? [],
  };
}

function campoEnPersonaDetalle(
  persona: PersonaDetalleClaims | undefined,
  etiquetas: string[],
): CampoDetalleClaims {
  return (
    persona?.campos.find(({ etiqueta }) =>
      coincideEtiquetaDetalle(etiqueta, etiquetas),
    ) ?? {
      etiqueta: etiquetas[0],
      valor: "",
      documentos: [],
    }
  );
}

export function evaluarEstadoComparacion(
  esperado: string,
  obtenido: string,
  modo: ModoComparacion,
): Exclude<EstadoComparacion, "NoComparable"> {
  const esperadoNormalizado = normalizarTexto(esperado);
  const obtenidoNormalizado = normalizarTexto(obtenido);

  if (esperadoNormalizado === obtenidoNormalizado) {
    return "Coincide";
  }

  switch (modo) {
    case "archivo":
      return extensionesArchivoEquivalentes(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "fecha":
      return fechasLocalizadasEquivalentes(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "telefono":
      return normalizarTelefono(esperado) === normalizarTelefono(obtenido)
        ? "Coincide"
        : "Diferente";
    case "numero":
      return normalizarNumero(esperado) === normalizarNumero(obtenido)
        ? "Coincide"
        : "Diferente";
    case "pais":
      return normalizarPais(esperado) === normalizarPais(obtenido) ||
        tienenCoincidenciaLexicaCatalogo(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "catalogo":
      return normalizarValorCatalogo(esperado) ===
        normalizarValorCatalogo(obtenido) ||
        tienenCoincidenciaLexicaCatalogo(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "contiene":
      return obtenidoNormalizado.includes(esperadoNormalizado) ||
        esperadoNormalizado.includes(obtenidoNormalizado) ||
        contienenEquivalenciaCatalogo(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "nombre":
      return nombresEquivalentes(esperado, obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    case "plan":
      return normalizarPlan(esperado) === normalizarPlan(obtenido)
        ? "CoincidenciaParcial"
        : "Diferente";
    default:
      return "Diferente";
  }
}

export class ComparacionDatosEmisionClaimsFlow {
  private readonly solicitudClaimsPage: SolicitudClaimsPage;
  private readonly comparaciones: ComparacionCampo[] = [];

  constructor(page: Page) {
    this.solicitudClaimsPage = new SolicitudClaimsPage(page);
  }

  private ultimoCampo(datos: DatosCotizacionGuardados, clave: string) {
    const coincidencias = datos.campos.filter((campo) => campo.clave === clave);
    return coincidencias[coincidencias.length - 1];
  }

  private ultimoCampoPorPatrones(
    datos: DatosCotizacionGuardados,
    patrones: string | string[],
  ) {
    const buscados = Array.isArray(patrones) ? patrones : [patrones];
    const coincidencias = datos.campos.filter((campo) =>
      buscados.some((patron) =>
        patron.endsWith("*")
          ? campo.clave.startsWith(patron.slice(0, -1))
          : campo.clave === patron,
      ),
    );
    return coincidencias[coincidencias.length - 1];
  }

  private valoresUnicosPorPatrones(
    datos: DatosCotizacionGuardados,
    patrones: string | string[],
  ) {
    const buscados = Array.isArray(patrones) ? patrones : [patrones];
    return new Set(
      datos.campos
        .filter((campo) =>
          buscados.some((patron) =>
            patron.endsWith("*")
              ? campo.clave.startsWith(patron.slice(0, -1))
              : campo.clave === patron,
          ),
        )
        .map(valorVisibleSeleccion)
        .filter((valor): valor is string => Boolean(valor)),
    );
  }

  private obtenerPersonaDetalle(
    respuesta: RespuestaDetalladaClaims,
    esperado: string | undefined,
  ) {
    if (!esperado) {
      return respuesta.personas[0];
    }
    return (
      respuesta.personas.find(({ titulo }) =>
        nombresEquivalentes(esperado, titulo),
      ) ?? respuesta.personas[0]
    );
  }

  private obtenerFilaDetalle(
    respuesta: RespuestaDetalladaClaims,
    esperado: string | undefined,
  ) {
    if (!esperado) {
      return respuesta.filas[0];
    }
    return (
      respuesta.filas.find((fila) => {
        const nombre = campoEnFilaDetalle(fila, ["Nombre del solicitante"]);
        return nombresEquivalentes(esperado, nombre.valor);
      }) ?? respuesta.filas[0]
    );
  }

  private compararDetallesPregunta(
    datos: DatosCotizacionGuardados,
    pestana: string,
    nombrePregunta: string,
    selectorClaims: string,
    respuestaClaims: RespuestaDetalladaClaims,
    definicion: PreguntaDetalladaEsperada,
    respuestaEsperada: string,
  ) {
    const esAfirmativa =
      normalizarValorCatalogo(respuestaEsperada) ===
      normalizarValorCatalogo("Si");

    if (!esAfirmativa) {
      return;
    }

    const campoPersona = this.ultimoCampoPorPatrones(
      datos,
      definicion.clavePersona,
    );
    const personaEsperada = valorVisibleSeleccion(campoPersona);
    const fila = this.obtenerFilaDetalle(respuestaClaims, personaEsperada);
    const persona = this.obtenerPersonaDetalle(
      respuestaClaims,
      personaEsperada,
    );
    const personaObtenida = fila
      ? campoEnFilaDetalle(fila, ["Nombre del solicitante"]).valor
      : persona?.titulo ?? "";

    this.agregar(
      pestana,
      `${nombrePregunta} - Persona asociada`,
      personaEsperada,
      personaObtenida,
      `cotizador#${definicion.clavePersona}`,
      `Claims${selectorClaims} persona`,
      "nombre",
    );

    const personasEsperadas = this.valoresUnicosPorPatrones(
      datos,
      definicion.clavePersona,
    );
    const cantidadPersonasClaims = respuestaClaims.filas.length
      ? respuestaClaims.filas.length
      : respuestaClaims.personas.length;
    this.agregar(
      pestana,
      `${nombrePregunta} - Cantidad de personas asociadas`,
      String(personasEsperadas.size || (personaEsperada ? 1 : 0)),
      String(cantidadPersonasClaims),
      `cotizador#${definicion.clavePersona}`,
      `Claims${selectorClaims} registros`,
      "numero",
    );

    const relacionEsperada = relacionEnTituloPersona(personaEsperada);
    if (relacionEsperada) {
      const relacionObtenida = fila
        ? campoEnFilaDetalle(fila, ["Tipo de solicitante"]).valor
        : relacionEnTituloPersona(persona?.titulo) ?? "";
      this.agregar(
        pestana,
        `${nombrePregunta} - Tipo de solicitante`,
        relacionEsperada,
        relacionObtenida,
        `cotizador#${definicion.clavePersona}`,
        `Claims${selectorClaims} tipo de solicitante`,
        "catalogo",
      );
    }

    for (const detalle of definicion.campos) {
      const capturado = this.ultimoCampoPorPatrones(datos, detalle.claves);
      const esperado = valorVisibleSeleccion(capturado);
      const obtenidoFila = fila
        ? campoEnFilaDetalle(fila, detalle.etiquetasClaims)
        : undefined;
      const obtenidoPersona = persona
        ? campoEnPersonaDetalle(persona, detalle.etiquetasClaims)
        : undefined;
      const documentos =
        obtenidoFila?.documentos ?? obtenidoPersona?.documentos ?? [];
      const obtenido =
        detalle.modo === "archivo"
          ? documentos.join(", ")
          : obtenidoFila?.valor ?? obtenidoPersona?.valor ?? "";
      const etiquetaClaims =
        obtenidoFila?.etiqueta ??
        obtenidoPersona?.etiqueta ??
        detalle.etiquetasClaims[0];

      this.agregar(
        pestana,
        `${nombrePregunta} - ${detalle.campo}`,
        esperado,
        obtenido,
        `cotizador#${detalle.claves.join("/")}`,
        `Claims${selectorClaims} ${etiquetaClaims}`,
        detalle.modo ?? "texto",
      );
    }
  }

  private valorCapturadoOConfiguracion(
    datos: DatosCotizacionGuardados,
    claves: string | string[],
    valorConfiguracion: string,
  ) {
    const candidatas = Array.isArray(claves) ? claves : [claves];
    for (const clave of candidatas) {
      const capturado = valorVisibleSeleccion(this.ultimoCampo(datos, clave));
      if (capturado !== undefined) {
        return capturado;
      }
    }
    return valorConfiguracion;
  }

  private agregar(
    pestana: string,
    campo: string,
    esperado: string | undefined,
    obtenido: string,
    fuenteCotizador: string,
    fuenteClaims: string,
    modo: ModoComparacion = "texto",
    detalle?: string,
  ) {
    let estado: EstadoComparacion;
    if (esperado === undefined) {
      estado = "NoComparable";
    } else {
      estado = evaluarEstadoComparacion(esperado, obtenido, modo);
    }

    this.comparaciones.push({
      pestana,
      campo,
      esperado: esperado ?? "<dato no capturado>",
      obtenido,
      estado,
      fuenteCotizador,
      fuenteClaims,
      detalle:
        detalle ??
        (estado === "CoincidenciaParcial"
          ? modo === "fecha"
            ? "Misma fecha con formato localizado entre cotizador y Claims"
            : modo === "archivo"
              ? "El documento capturado está disponible en Claims con nombre interno"
              : modo === "nombre"
                ? "La persona coincide por sus componentes de nombre"
                : "Equivalencia válida entre el valor del cotizador y su texto localizado en Claims"
          : undefined),
    });
  }

  private agregarCampoCapturado(
    datos: DatosCotizacionGuardados,
    pestana: string,
    campo: string,
    claveCotizador: string,
    obtenido: string,
    selectorClaims: string,
    modo: ModoComparacion = "texto",
  ) {
    const capturado = this.ultimoCampo(datos, claveCotizador);
    const modoEfectivo =
      modo === "texto" && capturado?.tipoDato === "seleccion"
        ? "catalogo"
        : modo;
    this.agregar(
      pestana,
      campo,
      valorCampo(capturado),
      obtenido,
      `cotizador#${claveCotizador}`,
      `Claims${selectorClaims}`,
      modoEfectivo,
    );
  }

  private async compararInformacionGeneral(datos: DatosCotizacionGuardados) {
    const pestana = "Información General";
    const claims = await this.solicitudClaimsPage.obtenerSolicitantePrimario();
    const mapeos: Array<
      [string, string, keyof typeof claims, string, ModoComparacion?]
    > = [
      ["Apellidos", "txtApPat", "apellidos", "#PrimarioApellido"],
      ["Primer nombre", "txtNombre", "primerNombre", "#PrimarioPNombre"],
      ["Segundo nombre", "txtNombreSegundo", "segundoNombre", "#PrimarioSNombre"],
      [
        "Fecha de nacimiento",
        "datepickerBirthdayTitular",
        "fechaNacimiento",
        "#PrimarioFechaNacimiento",
      ],
      [
        "País de nacimiento",
        "PaisNacimientoSelect",
        "paisNacimiento",
        "#PrimarioPnacimiento",
        "pais",
      ],
      ["Estatura", "Altura", "estatura", "#PrimarioEstatura", "numero"],
      ["Peso", "peso", "peso", "#PrimarioPeso", "numero"],
      [
        "Teléfono celular",
        "txtCelular",
        "telefonoCelular",
        "#PrimarioNtCelular",
        "telefono",
      ],
      [
        "Correo electrónico",
        "txtCorreoE",
        "correoElectronico",
        "#PrimarioDCElectronico",
      ],
      [
        "Ciudadanía",
        "CiudadaniaActualSelect",
        "ciudadania",
        "#PrimarioCiudadania",
        "pais",
      ],
      [
        "Número de identificación",
        "txtIdentificacion",
        "numeroIdentificacion",
        "#PrimarioNIdentificacion",
      ],
      [
        "País de expedición",
        "PaisEmisionSelect",
        "paisExpedicion",
        "#PrimarioPaisExpedicion",
        "pais",
      ],
      [
        "Archivo de identificación",
        "idInputFileArchivo",
        "archivoIdentificacion",
        "#PrimarioCopiaIdentifiacion",
      ],
      [
        "Dirección residencial",
        "idInputDireccion1",
        "direccionResidencial",
        "#PrimarioDireccionNP",
      ],
      [
        "País de residencia",
        "PaisResidenciaSelect",
        "paisResidencia",
        "#PrimarioPaisResidenciaNP",
        "pais",
      ],
      [
        "Ciudad residencial",
        "inputCiudadResidencia",
        "ciudadResidencial",
        "#PrimarioCiudadNP",
      ],
      [
        "Estado residencial",
        "EstadoResidenciaSelect",
        "estadoResidencial",
        "#PrimarioEstadoNP",
      ],
      [
        "Código postal residencial",
        "inputCPResidencia",
        "codigoPostalResidencial",
        "#PrimarioCodigoPostalNP",
      ],
    ];

    for (const [campo, clave, propiedad, selector, modo] of mapeos) {
      this.agregarCampoCapturado(
        datos,
        pestana,
        campo,
        clave,
        claims[propiedad],
        selector,
        modo,
      );
    }

    this.agregar(
      pestana,
      "Sexo al nacer",
      this.valorCapturadoOConfiguracion(
        datos,
        datos.configuracion.SexoAlNacer === "Masculino"
          ? "optMasculino"
          : "optFemenino",
        datos.configuracion.SexoAlNacer,
      ),
      claims.sexoAlNacer,
      "cotizador#optMasculino/optFemenino",
      "Claims#PrimarioSNacer",
      "catalogo",
    );
    this.agregar(
      pestana,
      "Estado civil",
      this.valorCapturadoOConfiguracion(
        datos,
        datos.configuracion.EstadoCivil === "Casado(a)"
          ? "optCasado"
          : "optSoltero",
        datos.configuracion.EstadoCivil,
      ),
      claims.estadoCivil,
      "cotizador#optCasado/optSoltero",
      "Claims#PrimarioECivil",
      "catalogo",
    );
    this.agregar(
      pestana,
      "Ocupación",
      this.valorCapturadoOConfiguracion(
        datos,
        "OcupacionSelect",
        datos.configuracion.OcupacionTitular,
      ),
      claims.ocupacion,
      "cotizador#OcupacionSelect",
      "Claims#PrimarioOcupacion",
      "catalogo",
    );
    this.agregar(
      pestana,
      "Tipo de identificación",
      this.valorCapturadoOConfiguracion(
        datos,
        "TipoIDSelect1",
        datos.configuracion.TipoIdentificacionTitular,
      ),
      claims.tipoIdentificacion,
      "cotizador#TipoIDSelect1",
      "Claims#PrimarioTIdentificacion",
      "catalogo",
    );

    const telefonoSecundarioEsperado =
      datos.configuracion.TelefonoSecundario === "Si" &&
      datos.configuracion.EliminarTelSec !== "Si"
        ? valorCampo(this.ultimoCampo(datos, "txtCelularSecondary"))
        : "";
    this.agregar(
      pestana,
      "Teléfono secundario",
      telefonoSecundarioEsperado,
      claims.telefonoSecundario,
      "cotizador#txtCelularSecondary/configuración",
      "Claims#PrimarioNTSecundario",
      "telefono",
    );

    const conservaCorrespondencia =
      datos.configuracion.DireccionCorrespondencia === "Si" &&
      datos.configuracion.EliminarDirCorr !== "Si";
    const correspondencia: Array<
      [string, string, keyof typeof claims, string, ModoComparacion?]
    > = [
      [
        "Dirección de correspondencia",
        "idInputDireccion2",
        "direccionCorrespondencia",
        "#PrimarioDireccionCorrespondencia",
      ],
      [
        "País de correspondencia",
        "PaisResidenciaSelectPostal",
        "paisCorrespondencia",
        "#PrimarioPaisResidenciaCorrespondencia",
        "pais",
      ],
      [
        "Ciudad de correspondencia",
        "inputCiudadResidenciaPostal",
        "ciudadCorrespondencia",
        "#PrimarioCiudadCorrespondencia",
      ],
      [
        "Estado de correspondencia",
        "EstadoResidenciaSelectPostal",
        "estadoCorrespondencia",
        "#PrimarioEstadoCorrespondencia",
      ],
      [
        "Código postal de correspondencia",
        "inputCPPostal",
        "codigoPostalCorrespondencia",
        "#PrimarioCodigoPostalCorrespondencia",
      ],
    ];
    for (const [campo, clave, propiedad, selector, modo] of correspondencia) {
      this.agregar(
        pestana,
        campo,
        conservaCorrespondencia
          ? valorCampo(this.ultimoCampo(datos, clave))
          : "",
        claims[propiedad],
        `cotizador#${clave}/configuración`,
        `Claims${selector}`,
        modo,
      );
    }
  }

  private obtenerDependientesEsperados(datos: DatosCotizacionGuardados) {
    const grupos: GrupoDependienteEsperado[] = [];
    let actual: GrupoDependienteEsperado | undefined;

    for (const campo of datos.campos) {
      const relacion = RELACIONES_DEPENDIENTES[campo.clave];
      if (relacion) {
        actual = {
          relacion,
          fuenteRelacion: `cotizador#${campo.clave}`,
          campos: [],
        };
        grupos.push(actual);
        continue;
      }
      actual?.campos.push(campo);
    }

    return grupos;
  }

  private compararCampoDependiente(
    pestana: string,
    indice: number,
    grupo: GrupoDependienteEsperado,
    claims: PersonaClaims,
    campo: string,
    clave: string,
    etiquetaClaims: string,
    modo: ModoComparacion = "texto",
  ) {
    this.agregar(
      pestana,
      `Persona ${indice + 1} - ${campo}`,
      valorCampo(campoEnGrupo(grupo, clave)),
      campoPersona(claims, etiquetaClaims),
      `cotizador#${clave}[${indice}]`,
      `Claims dependiente[${indice}].${etiquetaClaims}`,
      modo,
    );
  }

  private emparejarDependientes(
    esperados: GrupoDependienteEsperado[],
    obtenidos: PersonaClaims[],
  ) {
    const disponibles = new Set(obtenidos.map((_, indice) => indice));

    return esperados.map((esperado, posicion) => {
      const identidadEsperada = [
        valorCampo(campoEnGrupo(esperado, "txtNombreDependiente")),
        valorCampo(campoEnGrupo(esperado, "txtApPatDependiente")),
        valorCampo(campoEnGrupo(esperado, "datepickerBirthday")),
      ];
      let mejorIndice = -1;
      let mejorPuntaje = -1;

      for (const indice of disponibles) {
        const obtenido = obtenidos[indice];
        const identidadObtenida = [
          campoPersona(obtenido, "Primer Nombre"),
          campoPersona(obtenido, "Apellido(s)"),
          campoPersona(obtenido, "Fecha de Nacimiento"),
        ];
        const puntaje = identidadEsperada.reduce((total, valor, criterio) => {
          if (!valor) {
            return total;
          }
          return total +
            (normalizarTexto(valor) ===
            normalizarTexto(identidadObtenida[criterio] ?? "")
              ? 1
              : 0);
        }, 0);

        if (puntaje > mejorPuntaje) {
          mejorIndice = indice;
          mejorPuntaje = puntaje;
        }
      }

      // Dos datos de identidad evitan emparejar personas sólo por nombre.
      if (mejorIndice < 0 || mejorPuntaje < 2) {
        mejorIndice = disponibles.has(posicion)
          ? posicion
          : (disponibles.values().next().value ?? -1);
      }

      if (mejorIndice >= 0) {
        disponibles.delete(mejorIndice);
        return obtenidos[mejorIndice];
      }
      return undefined;
    });
  }

  private async compararDependientes(datos: DatosCotizacionGuardados) {
    const pestana = "Información General";
    const esperados = this.obtenerDependientesEsperados(datos);
    const obtenidos = await this.solicitudClaimsPage.obtenerDependientes();
    const emparejados = this.emparejarDependientes(esperados, obtenidos);

    this.agregar(
      pestana,
      "Cantidad de cónyuges/dependientes",
      String(esperados.length),
      String(obtenidos.length),
      "contexto de dependientes",
      "Claims#AcordionInAcordion",
      "numero",
    );

    for (let indice = 0; indice < esperados.length; indice++) {
      const esperado = esperados[indice];
      const obtenido = emparejados[indice];
      if (!obtenido) {
        this.agregar(
          pestana,
          `Persona ${indice + 1}`,
          esperado.relacion,
          "<persona no encontrada>",
          esperado.fuenteRelacion,
          `Claims dependiente[${indice}]`,
        );
        continue;
      }

      this.agregar(
        pestana,
        `Persona ${indice + 1} - relación`,
        esperado.relacion,
        obtenido.titulo,
        esperado.fuenteRelacion,
        `Claims dependiente[${indice}].titulo`,
        "contiene",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Apellidos",
        "txtApPatDependiente",
        "Apellido(s)",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Primer nombre",
        "txtNombreDependiente",
        "Primer Nombre",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Fecha de nacimiento",
        "datepickerBirthday",
        "Fecha de Nacimiento",
      );

      const campoSexo =
        campoEnGrupo(esperado, "optMasculinoBenefi") ??
        campoEnGrupo(esperado, "optFemeninoBenef");
      const sexoPredeterminado = campoEnGrupo(
        esperado,
        "optMasculinoBenefi",
      )
        ? "Masculino"
        : campoEnGrupo(esperado, "optFemeninoBenef")
          ? "Femenino"
          : undefined;
      this.agregar(
        pestana,
        `Persona ${indice + 1} - Sexo al nacer`,
        valorVisibleSeleccion(campoSexo) ?? sexoPredeterminado,
        campoPersona(obtenido, "Sexo al Nacer"),
        "cotizador#optMasculinoBenefi/optFemeninoBenef",
        `Claims dependiente[${indice}].Sexo al Nacer`,
        "catalogo",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "País de nacimiento",
        "PaisNacimientoSelectDependiente",
        "País de Nacimiento",
        "pais",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Estatura",
        "AlturaDependiente",
        "Estatura",
        "numero",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Peso",
        "pesoDependiente",
        "Peso",
        "numero",
      );
      this.compararCampoDependiente(
        pestana,
        indice,
        esperado,
        obtenido,
        "Ciudadanía",
        "PaisEmisionSelectDependienteSelectCiudadania",
        "Ciudadanía",
        "pais",
      );

      if (esperado.relacion === "Cónyuge") {
        this.agregar(
          pestana,
          `Persona ${indice + 1} - Estado civil`,
          valorVisibleSeleccion(
            campoEnGrupo(esperado, "optCasadoBenef"),
          ) ?? "Casado(a)",
          campoPersona(obtenido, "Estado Civil"),
          "cotizador#optCasadoBenef",
          `Claims dependiente[${indice}].Estado Civil`,
          "catalogo",
        );
        this.compararCampoDependiente(
          pestana,
          indice,
          esperado,
          obtenido,
          "Teléfono celular",
          "txtCelularDependiente",
          "N.º de Teléfono Celular",
          "telefono",
        );
        this.compararCampoDependiente(
          pestana,
          indice,
          esperado,
          obtenido,
          "Correo electrónico",
          "txtCorreoDEpendioente",
          "Dirección de Correo Electrónico",
        );
        this.agregar(
          pestana,
          `Persona ${indice + 1} - Ocupación`,
          valorCampo(campoEnGrupo(esperado, "OcupacionSelectDependiente")) ??
            datos.configuracion.OcupacionTitular,
          campoPersona(obtenido, "Ocupación"),
          "cotizador#OcupacionSelectDependiente",
          `Claims dependiente[${indice}].Ocupación`,
          "catalogo",
        );
        this.compararCampoDependiente(
          pestana,
          indice,
          esperado,
          obtenido,
          "País de residencia",
          "PaisResidenciaSelectDependientes",
          "País de Residencia",
          "pais",
        );
      } else {
        this.agregar(
          pestana,
          `Persona ${indice + 1} - Estudiante de tiempo completo`,
          valorVisibleSeleccion(campoEnGrupo(esperado, "optENO")) ?? "No",
          campoPersona(obtenido, "¿Es un estudiante de tiempo completo?"),
          "cotizador#optENO",
          `Claims dependiente[${indice}].Estudiante`,
          "catalogo",
        );
      }
    }
  }

  private async compararBeneficiario(datos: DatosCotizacionGuardados) {
    const pestana = "Información General";
    const claims = await this.solicitudClaimsPage.obtenerBeneficiario();
    const mapeos: Array<
      [string, string, keyof typeof claims, string, ModoComparacion?]
    > = [
      [
        "Beneficiario - Apellidos",
        "txtApPatBeneficiario",
        "apellidos",
        "#BeneficiarioApellidos",
      ],
      [
        "Beneficiario - Primer nombre",
        "txtNombreBeneficiario",
        "primerNombre",
        "#BeneficiarioPrimerNombre",
      ],
      [
        "Beneficiario - Fecha de nacimiento",
        "datepickerBirthdayBeneficiario",
        "fechaNacimiento",
        "#BeneficiarioFNacimiento",
      ],
      [
        "Beneficiario - Teléfono",
        "NumTelefonoBenef",
        "telefonoCelular",
        "#BeneficiarioNTCelular",
        "telefono",
      ],
      [
        "Beneficiario - Correo electrónico",
        "idDireccionBenef",
        "correoElectronico",
        "#BeneficiarioDCElectronico",
      ],
      [
        "Beneficiario - Ciudadanía",
        "PaisCiudadaniaSelectBenef",
        "ciudadania",
        "#BeneficiarioCiudadania",
        "pais",
      ],
      [
        "Beneficiario - País de residencia",
        "PaisResidenciaSelectBenef",
        "paisResidencia",
        "#BeneficiarioPResidencia",
        "pais",
      ],
    ];

    for (const [campo, clave, propiedad, selector, modo] of mapeos) {
      this.agregarCampoCapturado(
        datos,
        pestana,
        campo,
        clave,
        claims[propiedad],
        selector,
        modo,
      );
    }
    this.agregar(
      pestana,
      "Beneficiario - Relación",
      this.valorCapturadoOConfiguracion(
        datos,
        "RelacionAseguradoSelectBeneficiario",
        datos.configuracion.RelacionSolicitantePrimario,
      ),
      claims.relacion,
      "cotizador#RelacionAseguradoSelectBeneficiario",
      "Claims#NombreCompleto",
      "contiene",
    );
  }

  private async compararCoberturas(datos: DatosCotizacionGuardados) {
    const pestana = "Coberturas de Seguro / Médicos tratantes";
    const claims = await this.solicitudClaimsPage.obtenerRespuestasCoberturas();
    const esAfirmativo = normalizarTexto(
      datos.configuracion.CuestionarioMedicoCaptura,
    ) === "SI";
    const clavesAfirmativas = [
      "optSiExiste_24",
      "optSiExiste",
      "optSiEstatus",
      "optSiExiste_23",
      "optSiExiste_19",
      "optSiTiene",
    ];
    const clavesNegativas = [
      "optNoExiste_24",
      "optNoExiste",
      "optNoEstatus",
      "optNoExiste_23",
      "optNoExiste_19",
      "optNoTiene",
    ];

    for (let numero = 1; numero <= 6; numero++) {
      const clave = (esAfirmativo ? clavesAfirmativas : clavesNegativas)[
        numero - 1
      ];
      const esperado = this.valorCapturadoOConfiguracion(
        datos,
        clave,
        datos.configuracion.CuestionarioMedicoCaptura,
      );
      const respuestaClaims = claims[`Pregunta ${numero}`];
      this.agregar(
        pestana,
        `Pregunta ${numero}`,
        esperado,
        respuestaClaims?.respuesta ?? "",
        `cotizador#${clave}`,
        `Claims#PreguntaCoberturas${numero}`,
        "catalogo",
      );

      if (respuestaClaims) {
        this.compararDetallesPregunta(
          datos,
          pestana,
          `Pregunta ${numero}`,
          `#PreguntaCoberturas${numero}`,
          respuestaClaims,
          DETALLES_COBERTURAS[numero],
          esperado,
        );
      }
    }
  }

  private async compararCuestionario(datos: DatosCotizacionGuardados) {
    const pestana = "Cuestionario";
    const claims = await this.solicitudClaimsPage.obtenerRespuestasCuestionario();
    const prefijo =
      normalizarTexto(datos.configuracion.CapturaPreguntasPt2) === "SI"
        ? "optSiExiste"
        : "optNoExiste";

    for (let numero = 1; numero <= 18; numero++) {
      const letra = String.fromCharCode(64 + numero);
      const clave = `${prefijo}_${numero}`;
      const esperado = this.valorCapturadoOConfiguracion(
        datos,
        clave,
        datos.configuracion.CapturaPreguntasPt2,
      );
      const respuestaClaims = claims[`Sección I - Pregunta ${letra}`];
      this.agregar(
        pestana,
        `Sección I - Pregunta ${letra}`,
        esperado,
        respuestaClaims?.respuesta ?? "",
        `cotizador#${clave}`,
        `Claims#CuestinarioSeccion1_${letra}`,
        "catalogo",
      );

      if (respuestaClaims) {
        this.compararDetallesPregunta(
          datos,
          pestana,
          `Sección I - Pregunta ${letra}`,
          `#CuestinarioSeccion1_${letra}`,
          respuestaClaims,
          DETALLES_CUESTIONARIO[letra],
          esperado,
        );
      }
    }

    for (let numero = 1; numero <= 3; numero++) {
      const letra = String.fromCharCode(64 + numero);
      const respuestaClaims = claims[`Sección II - Pregunta ${letra}`];
      if (!respuestaClaims) {
        continue;
      }
      const claves = [`optSiExiste_${numero + 19}`, `optNoExiste_${numero + 19}`];
      const esperado =
        valorVisibleSeleccion(this.ultimoCampoPorPatrones(datos, claves)) ?? "No";
      this.agregar(
        pestana,
        `Sección II - Pregunta ${letra}`,
        esperado,
        respuestaClaims.respuesta,
        `cotizador#${claves.join("/")}`,
        `Claims#CuestinarioSeccion2_${letra}`,
        "catalogo",
      );
    }
  }

  private async compararPlan(datos: DatosCotizacionGuardados) {
    const pestana = "Plan y Frecuencia de Pago";
    const claims = await this.solicitudClaimsPage.obtenerPlanYFrecuencia();

    this.agregar(
      pestana,
      "Plan",
      datos.configuracion.CotizarPlan,
      claims.plan,
      "configuracion.CotizarPlan",
      "Claims#PlanFP",
      "plan",
    );
    this.agregar(
      pestana,
      "Red de proveedores",
      datos.configuracion.RedProveedores,
      claims.redProveedores,
      "configuracion.RedProveedores",
      "Claims#RedProvedoresFP",
      "catalogo",
    );
    this.agregar(
      pestana,
      "Deducible",
      datos.configuracion.Deducible,
      claims.deducible,
      "configuracion.Deducible",
      "Claims#DeducibleFP",
      "catalogo",
    );
    this.agregar(
      pestana,
      "Frecuencia de pago",
      datos.configuracion.FrecuenciaPago,
      claims.frecuenciaPago,
      "configuracion.FrecuenciaPago",
      "Claims#FrecuenciaPagoFP",
      "catalogo",
    );
  }

  private async compararIdioma(datos: DatosCotizacionGuardados) {
    const pestana = "Idioma";
    const claims = await this.solicitudClaimsPage.obtenerIdioma();
    this.agregar(
      pestana,
      "Idioma seleccionado",
      IDIOMAS_CLAIMS[datos.configuracion.IdiomaCotizacion],
      claims,
      "configuracion.IdiomaCotizacion",
      "Claims#TextIdiomaSeleccionado",
      "catalogo",
    );
  }

  private async compararLimitaciones(datos: DatosCotizacionGuardados) {
    const pestana = "Limitaciones";
    const claims = await this.solicitudClaimsPage.obtenerSolicitantesLimitaciones();
    const dependientes = this.obtenerDependientesEsperados(datos);
    const nombresEsperados = [
      ["Titular", ["txtNombre", "txtNombreSegundo", "txtApPat"]],
      ...dependientes.map((grupo, indice) => [
        `Persona ${indice + 1}`,
        [
          valorCampo(campoEnGrupo(grupo, "txtNombreDependiente")) ?? "",
          valorCampo(campoEnGrupo(grupo, "txtApPatDependiente")) ?? "",
        ],
      ]),
    ] as Array<[string, string[]]>;

    nombresEsperados[0][1] = nombresEsperados[0][1].map(
      (clave) => valorCampo(this.ultimoCampo(datos, clave)) ?? "",
    );

    this.agregar(
      pestana,
      "Cantidad de solicitantes",
      String(nombresEsperados.length),
      String(claims.length),
      "contexto de cotización",
      "Claims#Exclusiones",
      "numero",
    );

    for (const [tipo, partes] of nombresEsperados) {
      const esperado = partes.filter(Boolean).join(" ");
      const encontrado = claims.find((nombre) =>
        nombresEquivalentes(esperado, nombre),
      );
      this.agregar(
        pestana,
        `${tipo} disponible para limitaciones`,
        esperado,
        encontrado ?? claims.join(" | "),
        "nombres capturados en cotizador",
        "Claims#Exclusiones a",
        "nombre",
      );
    }
  }

  private async compararContrato() {
    const pestana = "Contrato";
    const documentos = await this.solicitudClaimsPage.obtenerDocumentosContrato();

    for (const documento of DOCUMENTOS_CONTRATO_ESPERADOS) {
      const encontrado = documentos.find(
        (actual) => normalizarTexto(actual) === normalizarTexto(documento),
      );
      this.agregar(
        pestana,
        `Documento ${documento}`,
        documento,
        encontrado ?? documentos.join(" | "),
        "documentos requeridos por el flujo",
        "Claims#Contrato",
      );
    }
  }

  private construirResultado(
    datos: DatosCotizacionGuardados,
    error?: { etapa: string; mensaje: string },
  ): ResultadoComparacionDatos {
    const pestanas: ComparacionPestana[] = PESTANAS_COMPARACION.map((pestana) => {
      const comparaciones = this.comparaciones.filter(
        (comparacion) => comparacion.pestana === pestana,
      );
      return {
        pestana,
        comparaciones,
        resumen: obtenerResumen(comparaciones),
      };
    });
    const resumen = obtenerResumen(this.comparaciones);

    return {
      idEjecucion: randomUUID(),
      fechaHora: new Date().toISOString(),
      escenario: datos.configuracion.EscenarioPrueba,
      numeroPoliza: datos.numeroPoliza,
      estado: error
        ? "Error"
        : resumen.diferentes > 0
          ? "ConDiferencias"
          : "Exitosa",
      resumen,
      pestanas,
      error,
    };
  }

  async ejecutar(datos: DatosCotizacionGuardados) {
    this.comparaciones.length = 0;
    const etapas: Array<[string, () => Promise<void>]> = [
      ["Información General - titular", () => this.compararInformacionGeneral(datos)],
      ["Información General - dependientes", () => this.compararDependientes(datos)],
      ["Información General - beneficiario", () => this.compararBeneficiario(datos)],
      ["Coberturas de Seguro / Médicos tratantes", () => this.compararCoberturas(datos)],
      ["Cuestionario", () => this.compararCuestionario(datos)],
      ["Plan y Frecuencia de Pago", () => this.compararPlan(datos)],
      ["Idioma", () => this.compararIdioma(datos)],
      ["Limitaciones", () => this.compararLimitaciones(datos)],
      ["Contrato", () => this.compararContrato()],
    ];

    for (const [etapa, comparar] of etapas) {
      try {
        await comparar();
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        const resultado = this.construirResultado(datos, { etapa, mensaje });
        const rutaLog = await guardarLogComparacionDatos(resultado);
        throw new Error(
          `No fue posible completar la comparación en ${etapa} para la póliza ${datos.numeroPoliza}. Consulte ${rutaLog}. Causa: ${mensaje}`,
        );
      }
    }

    const resultado = this.construirResultado(datos);
    const rutaLog = await guardarLogComparacionDatos(resultado);

    if (resultado.resumen.diferentes > 0) {
      const campos = this.comparaciones
        .filter(({ estado }) => estado === "Diferente")
        .map(({ pestana, campo }) => `${pestana}/${campo}`)
        .slice(0, 10)
        .join(", ");
      throw new Error(
        `Se detectaron ${resultado.resumen.diferentes} diferencias para la póliza ${datos.numeroPoliza}. Consulte ${rutaLog}. Campos: ${campos}`,
      );
    }

    return { resultado, rutaLog };
  }
}
