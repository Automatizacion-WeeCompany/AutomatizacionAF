import { EscenarioExcel } from "../types/EscenarioExcel";
import {
  ComparacionTarifa,
  DatosTarifaVisible,
  OpcionPaisResidencia,
} from "../types/ValidacionTarifas";
import {
  normalizarPaisTarifa,
  normalizarTextoTarifa,
} from "./NormalizarPaisTarifa";

type FilaTarifa = [number, string, string, string, number, number, number];

interface CatalogoTarifas {
  metadata: {
    version: string;
    vigenteDesde: string;
    moneda: string;
    recargoMensual: number;
    tolerancia: number;
    conteos: { adultos: number; dependientes: number };
  };
  reglas: {
    paisesDirectosProtect: string[];
    zonaCaribeProtect: string;
    zonaCaribeDependientesPlanesAnteriores: string;
    redSinCoberturaEstadosUnidos: string;
    frecuencias: Record<string, { recargo: number; recibos: number }>;
  };
  adultos: FilaTarifa[];
  dependientes: FilaTarifa[];
}

const catalogo = require("../datos/tarifas/tarifas-af-2026-12.json") as CatalogoTarifas;
const paisesDirectosProtect = new Set(catalogo.reglas.paisesDirectosProtect);

function claveTarifa(
  edadOCantidad: number,
  pais: string,
  plan: string,
  red: string,
  deducibleDentro: number,
  deducibleFuera: number,
) {
  return [
    edadOCantidad,
    pais,
    plan,
    red,
    deducibleDentro,
    deducibleFuera,
  ].join("|");
}

const tarifasAdultos = new Map(
  catalogo.adultos.map((fila) => [claveTarifa(...fila.slice(0, 6) as [number, string, string, string, number, number]), fila[6]]),
);
const tarifasDependientes = new Map(
  catalogo.dependientes.map((fila) => [claveTarifa(...fila.slice(0, 6) as [number, string, string, string, number, number]), fila[6]]),
);

export class TarifaReferenciaNoDisponibleError extends Error {
  constructor(
    detalle: string,
    readonly dimensiones: Record<string, string | number>,
  ) {
    super(detalle);
    this.name = "TarifaReferenciaNoDisponibleError";
  }
}

export class TarifaNoCoincideError extends Error {
  constructor(readonly comparacion: ComparacionTarifa) {
    super(
      `Tarifa distinta al catálogo ${comparacion.version}: esperada ${comparacion.moneda} ${comparacion.montoEsperado.toFixed(2)}, ` +
        `obtenida ${comparacion.moneda} ${comparacion.montoObtenido.toFixed(2)}, diferencia ${comparacion.diferencia.toFixed(2)}. ` +
        comparacion.explicacion,
    );
    this.name = "TarifaNoCoincideError";
  }
}

function normalizarPlan(valor: string) {
  const plan = normalizarTextoTarifa(valor).replace(/^AF/, "");
  const equivalencias: Record<string, string> = {
    SUPERIOR: "Superior",
    OPTIMA: "Optima",
    VITAL: "Vital",
    PROTECT: "Protect",
  };
  const normalizado = equivalencias[plan];
  if (!normalizado) {
    throw new Error(`Plan sin equivalencia tarifaria: ${valor}`);
  }
  return normalizado;
}

function normalizarRed(valor: string) {
  const red = normalizarTextoTarifa(valor);
  if (
    red === "LATAM" ||
    red.includes("SINCOBERTURA") ||
    red.includes("WITHOUTCOVERAGE") ||
    red.includes("SEMCOBERTURA")
  ) {
    return catalogo.reglas.redSinCoberturaEstadosUnidos;
  }
  const equivalencias: Record<string, string> = {
    OPEN: "Open",
    ULTRA: "Ultra",
    PLUS: "Plus",
    CORE: "Core",
  };
  const normalizada = equivalencias[red];
  if (!normalizada) {
    throw new Error(`Red sin equivalencia tarifaria: ${valor}`);
  }
  return normalizada;
}

function convertirNumeroTarifa(valor: string) {
  const limpio = valor.replace(/[^\d.,]/g, "");
  const ultimaComa = limpio.lastIndexOf(",");
  const ultimoPunto = limpio.lastIndexOf(".");
  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const separadorDecimal = ultimaComa > ultimoPunto ? "," : ".";
    const separadorMiles = separadorDecimal === "," ? "." : ",";
    return Number(
      limpio.split(separadorMiles).join("").replace(separadorDecimal, "."),
    );
  }
  if (/^\d{1,3}([,.]\d{3})+$/.test(limpio)) {
    return Number(limpio.replace(/[,.]/g, ""));
  }
  return Number(limpio.replace(",", "."));
}

export function obtenerDeducibles(valor: string) {
  const montos = valor.match(/\d[\d.,]*/g)?.map(convertirNumeroTarifa) ?? [];
  if (montos.length < 2 || montos.slice(0, 2).some((monto) => !Number.isFinite(monto))) {
    throw new Error(`Deducible sin formato tarifario fuera/dentro: ${valor}`);
  }
  return { deducibleFuera: montos[0], deducibleDentro: montos[1] };
}

function obtenerFrecuencia(valor: string) {
  const clave = normalizarTextoTarifa(valor);
  const nombre = Object.keys(catalogo.reglas.frecuencias).find(
    (candidato) => normalizarTextoTarifa(candidato) === clave,
  );
  if (!nombre) {
    throw new Error(`Frecuencia sin regla tarifaria: ${valor}`);
  }
  return { nombre, ...catalogo.reglas.frecuencias[nombre] };
}

function cantidadDependientes(valor: string | number | undefined) {
  const cantidad = Number.parseInt(String(valor ?? "0"), 10);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return 0;
  }
  return Math.min(cantidad, 3);
}

function redondearMoneda(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function resolverZonaPais(plan: string, paisIso: string, dependientes: boolean) {
  if (plan === "Protect") {
    return paisesDirectosProtect.has(paisIso)
      ? paisIso
      : catalogo.reglas.zonaCaribeProtect;
  }
  if (dependientes && paisIso === "TC") {
    return catalogo.reglas.zonaCaribeDependientesPlanesAnteriores;
  }
  return paisIso;
}

function buscarTarifa(
  tabla: Map<string, number>,
  edadOCantidad: number,
  pais: string,
  plan: string,
  red: string,
  deducibleDentro: number,
  deducibleFuera: number,
  tipo: "adulto" | "dependientes",
) {
  const dimensiones = {
    tipo,
    edadOCantidad,
    pais,
    plan,
    red,
    deducibleDentro,
    deducibleFuera,
  };
  const monto = tabla.get(
    claveTarifa(
      edadOCantidad,
      pais,
      plan,
      red,
      deducibleDentro,
      deducibleFuera,
    ),
  );
  if (monto === undefined) {
    throw new TarifaReferenciaNoDisponibleError(
      `No existe tarifa de ${tipo} para ${JSON.stringify(dimensiones)}`,
      dimensiones,
    );
  }
  return monto;
}

export interface EntradaCalculoTarifa {
  escenario: EscenarioExcel;
  pais: OpcionPaisResidencia;
  edadTitular: number;
  edadConyuge?: number;
}

export function calcularTarifaEsperada({
  escenario,
  pais,
  edadTitular,
  edadConyuge,
}: EntradaCalculoTarifa) {
  const plan = normalizarPlan(escenario.CotizarPlan);
  const red = normalizarRed(escenario.RedProveedores);
  const paisIso = normalizarPaisTarifa(pais.texto);
  const zonaAdultos = resolverZonaPais(plan, paisIso, false);
  const zonaDependientes = resolverZonaPais(plan, paisIso, true);
  const { deducibleDentro, deducibleFuera } = obtenerDeducibles(
    escenario.Deducible,
  );
  const frecuencia = obtenerFrecuencia(escenario.FrecuenciaPago);

  const tarifaTitular = buscarTarifa(
    tarifasAdultos,
    edadTitular,
    zonaAdultos,
    plan,
    red,
    deducibleDentro,
    deducibleFuera,
    "adulto",
  );

  const incluyeConyuge =
    escenario.TipoPoliza === "Familiar" &&
    normalizarTextoTarifa(escenario.ConyugePareja) === "SI";
  if (incluyeConyuge && edadConyuge === undefined) {
    throw new TarifaReferenciaNoDisponibleError(
      "La cotización incluye cónyuge, pero no se conservó su edad para calcular la tarifa",
      { tipo: "adulto", pais: zonaAdultos, plan, red },
    );
  }
  const tarifaConyuge = incluyeConyuge
    ? buscarTarifa(
        tarifasAdultos,
        edadConyuge as number,
        zonaAdultos,
        plan,
        red,
        deducibleDentro,
        deducibleFuera,
        "adulto",
      )
    : 0;

  const dependientes =
    escenario.TipoPoliza === "Familiar"
      ? cantidadDependientes(escenario.HijosMenoresDe24)
      : 0;
  const tarifaDependientes = dependientes
    ? buscarTarifa(
        tarifasDependientes,
        dependientes,
        zonaDependientes,
        plan,
        red,
        deducibleDentro,
        deducibleFuera,
        "dependientes",
      )
    : 0;

  const montoBase = tarifaTitular + tarifaConyuge + tarifaDependientes;
  const montoRecargo = redondearMoneda(montoBase * frecuencia.recargo);
  const montoAnual = redondearMoneda(montoBase + montoRecargo);
  const montoPorRecibo = redondearMoneda(montoAnual / frecuencia.recibos);

  return {
    version: catalogo.metadata.version,
    vigenteDesde: catalogo.metadata.vigenteDesde,
    moneda: catalogo.metadata.moneda,
    paisIso,
    zonaAdultos,
    zonaDependientes,
    plan,
    red,
    deducibleDentro,
    deducibleFuera,
    frecuencia: frecuencia.nombre,
    recargo: frecuencia.recargo,
    recibos: frecuencia.recibos,
    tarifaTitular,
    tarifaConyuge,
    tarifaDependientes,
    montoBase,
    montoRecargo,
    montoAnual,
    montoPorRecibo,
  };
}

export function compararTarifa(
  entrada: EntradaCalculoTarifa,
  tarifaVisible: DatosTarifaVisible,
): ComparacionTarifa {
  const calculo = calcularTarifaEsperada(entrada);
  const diferencia = redondearMoneda(tarifaVisible.monto - calculo.montoPorRecibo);
  const coincide = Math.abs(diferencia) <= catalogo.metadata.tolerancia;
  const explicacion = coincide
    ? `Coincide con el pago por recibo (${calculo.recibos} recibo(s)); recargo aplicado ${(calculo.recargo * 100).toFixed(0)}%.`
    : `Base: ${calculo.tarifaTitular.toFixed(2)} titular + ${calculo.tarifaConyuge.toFixed(2)} cónyuge + ` +
      `${calculo.tarifaDependientes.toFixed(2)} dependientes = ${calculo.montoBase.toFixed(2)}; ` +
      `recargo ${(calculo.recargo * 100).toFixed(0)}% = ${calculo.montoRecargo.toFixed(2)}; ` +
      `${calculo.recibos} recibo(s). Dimensiones: país ${calculo.paisIso}→${calculo.zonaAdultos}, ` +
      `plan ${calculo.plan}, red ${calculo.red}, deducible fuera/dentro ${calculo.deducibleFuera}/${calculo.deducibleDentro}.`;

  return {
    version: calculo.version,
    vigenteDesde: calculo.vigenteDesde,
    moneda: calculo.moneda,
    montoEsperado: calculo.montoPorRecibo,
    montoObtenido: tarifaVisible.monto,
    diferencia,
    coincide,
    textoVisible: tarifaVisible.texto,
    explicacion,
    calculo,
  };
}

export function validarTarifa(
  entrada: EntradaCalculoTarifa,
  tarifaVisible: DatosTarifaVisible,
) {
  const comparacion = compararTarifa(entrada, tarifaVisible);
  if (!comparacion.coincide) {
    throw new TarifaNoCoincideError(comparacion);
  }
  return comparacion;
}

export function obtenerMetadatosCatalogoTarifas() {
  return catalogo.metadata;
}
