import { randomUUID } from "node:crypto";
import { Page } from "@playwright/test";
import { SolicitudClaimsPage, PersonaClaims } from "../paginas/solicitudClaimsPage";
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

type ModoComparacion =
  | "texto"
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

function crearCatalogoPaises() {
  const catalogo = new Map<string, string>();
  const Constructor = (Intl as unknown as { DisplayNames?: ConstructorDisplayNames })
    .DisplayNames;

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
            catalogo.set(normalizarTexto(nombre), codigo);
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
  };

  for (const [nombre, codigo] of Object.entries(alias)) {
    catalogo.set(normalizarTexto(nombre), codigo);
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
  return (
    tokensEsperados.length > 0 &&
    tokensEsperados.every((token) => tokensObtenidos.includes(token))
  );
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

  private valoresCoinciden(
    esperado: string,
    obtenido: string,
    modo: ModoComparacion,
  ) {
    switch (modo) {
      case "telefono":
        return normalizarTelefono(esperado) === normalizarTelefono(obtenido);
      case "numero":
        return normalizarNumero(esperado) === normalizarNumero(obtenido);
      case "pais":
        return normalizarPais(esperado) === normalizarPais(obtenido);
      case "contiene":
        return normalizarTexto(obtenido).includes(normalizarTexto(esperado));
      case "nombre":
        return nombresEquivalentes(esperado, obtenido);
      case "plan":
        return normalizarPlan(esperado) === normalizarPlan(obtenido);
      default:
        return normalizarTexto(esperado) === normalizarTexto(obtenido);
    }
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
      estado = this.valoresCoinciden(esperado, obtenido, modo)
        ? "Coincide"
        : "Diferente";
    }

    this.comparaciones.push({
      pestana,
      campo,
      esperado: esperado ?? "<dato no capturado>",
      obtenido,
      estado,
      fuenteCotizador,
      fuenteClaims,
      detalle,
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
    this.agregar(
      pestana,
      campo,
      valorCampo(this.ultimoCampo(datos, claveCotizador)),
      obtenido,
      `cotizador#${claveCotizador}`,
      `Claims${selectorClaims}`,
      modo,
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
      datos.configuracion.SexoAlNacer,
      claims.sexoAlNacer,
      "configuracion.SexoAlNacer",
      "Claims#PrimarioSNacer",
    );
    this.agregar(
      pestana,
      "Estado civil",
      datos.configuracion.EstadoCivil,
      claims.estadoCivil,
      "configuracion.EstadoCivil",
      "Claims#PrimarioECivil",
    );
    this.agregar(
      pestana,
      "Ocupación",
      datos.configuracion.OcupacionTitular,
      claims.ocupacion,
      "configuracion.OcupacionTitular",
      "Claims#PrimarioOcupacion",
    );
    this.agregar(
      pestana,
      "Tipo de identificación",
      datos.configuracion.TipoIdentificacionTitular,
      claims.tipoIdentificacion,
      "configuracion.TipoIdentificacionTitular",
      "Claims#PrimarioTIdentificacion",
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

  private async compararDependientes(datos: DatosCotizacionGuardados) {
    const pestana = "Información General";
    const esperados = this.obtenerDependientesEsperados(datos);
    const obtenidos = await this.solicitudClaimsPage.obtenerDependientes();

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
      const obtenido = obtenidos[indice];
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

      const sexo = campoEnGrupo(esperado, "optMasculinoBenefi")
        ? "Masculino"
        : campoEnGrupo(esperado, "optFemeninoBenef")
          ? "Femenino"
          : undefined;
      this.agregar(
        pestana,
        `Persona ${indice + 1} - Sexo al nacer`,
        sexo,
        campoPersona(obtenido, "Sexo al Nacer"),
        "cotizador#optMasculinoBenefi/optFemeninoBenef",
        `Claims dependiente[${indice}].Sexo al Nacer`,
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
          "Casado(a)",
          campoPersona(obtenido, "Estado Civil"),
          "flujo de cónyuge",
          `Claims dependiente[${indice}].Estado Civil`,
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
          datos.configuracion.OcupacionTitular,
          campoPersona(obtenido, "Ocupación"),
          "configuracion.OcupacionTitular",
          `Claims dependiente[${indice}].Ocupación`,
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
          "No",
          campoPersona(obtenido, "¿Es un estudiante de tiempo completo?"),
          "flujo de dependiente",
          `Claims dependiente[${indice}].Estudiante`,
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
      datos.configuracion.RelacionSolicitantePrimario,
      claims.relacion,
      "configuracion.RelacionSolicitantePrimario",
      "Claims#NombreCompleto",
      "contiene",
    );
  }

  private async compararCoberturas(datos: DatosCotizacionGuardados) {
    const pestana = "Coberturas de Seguro / Médicos tratantes";
    const claims = await this.solicitudClaimsPage.obtenerRespuestasCoberturas();
    const esperado = datos.configuracion.CuestionarioMedicoCaptura;

    for (let numero = 1; numero <= 6; numero++) {
      this.agregar(
        pestana,
        `Pregunta ${numero}`,
        esperado,
        claims[`Pregunta ${numero}`] ?? "",
        "configuracion.CuestionarioMedicoCaptura",
        `Claims#PreguntaCoberturas${numero}`,
      );
    }
  }

  private async compararCuestionario(datos: DatosCotizacionGuardados) {
    const pestana = "Cuestionario";
    const claims = await this.solicitudClaimsPage.obtenerRespuestasCuestionario();
    const esperado = datos.configuracion.CapturaPreguntasPt2;

    for (let numero = 1; numero <= 18; numero++) {
      const letra = String.fromCharCode(64 + numero);
      this.agregar(
        pestana,
        `Pregunta ${letra}`,
        esperado,
        claims[`Pregunta ${letra}`] ?? "",
        "configuracion.CapturaPreguntasPt2",
        `Claims#CuestinarioSeccion1_${letra}`,
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
    );
    this.agregar(
      pestana,
      "Deducible",
      datos.configuracion.Deducible,
      claims.deducible,
      "configuracion.Deducible",
      "Claims#DeducibleFP",
    );
    this.agregar(
      pestana,
      "Frecuencia de pago",
      datos.configuracion.FrecuenciaPago,
      claims.frecuenciaPago,
      "configuracion.FrecuenciaPago",
      "Claims#FrecuenciaPagoFP",
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
