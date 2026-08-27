const { createHash } = require("node:crypto");
const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");

const VERSION_TARIFAS = "2026-12";
const PLANES = ["Superior", "Optima", "Vital", "Protect"];
const REDES = ["Open", "Ultra", "Plus", "Core", "LATAM"];
const PAISES_DIRECTOS_PROTECT = [
  "AR",
  "BO",
  "BR",
  "CL",
  "CO",
  "CR",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PY",
  "SV",
  "UY",
];

const ALIAS_PAISES = {
  ANGUILA: "AI",
  ANTIGUAYBARBUDA: "AG",
  ARGENTINA: "AR",
  ARUBA: "AW",
  BAHAMAS: "BS",
  BOLIVIA: "BO",
  BRASIL: "BR",
  BRAZIL: "BR",
  CARIBE: "CARIBE",
  CARIBBEAN: "CARIBBEAN",
  CHILE: "CL",
  COLOMBIA: "CO",
  COSTARICA: "CR",
  CURACAO: "CW",
  DOMINICA: "DM",
  ELSALVADOR: "SV",
  ESTADOPLURINACIONALDEBOLIVIA: "BO",
  GRANADA: "GD",
  GRENADA: "GD",
  GUADALUPE: "GP",
  GUADELOUPE: "GP",
  GUATEMALA: "GT",
  HONDURAS: "HN",
  ISLASCAIMAN: "KY",
  CAYMANISLANDS: "KY",
  ISLASTURCASYCAICOS: "TC",
  TURKSANDCAICOSISLANDS: "TC",
  ISLASVIRGENESBRITANICAS: "VG",
  BRITISHVIRGINISLANDS: "VG",
  JAMAICA: "JM",
  MARTINICA: "MQ",
  MARTINIQUE: "MQ",
  MEXICO: "MX",
  MONTSERRAT: "MS",
  NICARAGUA: "NI",
  PANAMA: "PA",
  PARAGUAY: "PY",
  PERU: "PE",
  PUERTORICO: "PR",
  REPUBLICADOMINICANA: "DO",
  DOMINICANREPUBLIC: "DO",
  SANBARTOLOME: "BL",
  SAINTBARTHELEMY: "BL",
  SANKITTSYNEVIS: "KN",
  SANCRISTOBALYNIEVES: "KN",
  SAINTKITTSANDNEVIS: "KN",
  SANEUSTAQUIOYSABABONAIRE: "BQ",
  BONAIRESINTEUSTATIUSANDSABA: "BQ",
  SANMARTINPARTEFRANCESA: "MF",
  SAINTMARTINFRENCHPART: "MF",
  SANVICENTEYLASGRANADINAS: "VC",
  SAINTVINCENTANDTHEGRENADINES: "VC",
  SANTALUCIA: "LC",
  SAINTLUCIA: "LC",
  TRINIDADYTOBAGO: "TT",
  TRINIDADANDTOBAGO: "TT",
  URUGUAY: "UY",
};

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
}

function normalizarPais(valor) {
  const clave = normalizarTexto(valor);
  const pais = ALIAS_PAISES[clave];
  if (!pais) {
    throw new Error(`País no reconocido en catálogo: ${valor}`);
  }
  return pais;
}

function normalizarPlan(valor) {
  const clave = normalizarTexto(valor).replace(/^AF/, "");
  const plan = PLANES.find((candidato) => normalizarTexto(candidato) === clave);
  if (!plan) {
    throw new Error(`Plan no reconocido en catálogo: ${valor}`);
  }
  return plan;
}

function normalizarRed(valor) {
  const clave = normalizarTexto(valor);
  const red = REDES.find((candidata) => normalizarTexto(candidata) === clave);
  if (!red) {
    throw new Error(`Red no reconocida en catálogo: ${valor}`);
  }
  return red;
}

function filasCompletas(hoja) {
  return XLSX.utils
    .sheet_to_json(hoja, { header: 1, defval: null })
    .slice(1)
    .filter((fila) => fila.slice(0, 7).every((valor) => valor !== null && valor !== ""));
}

function sha256(ruta) {
  return createHash("sha256").update(readFileSync(ruta)).digest("hex");
}

function claveFila(fila) {
  return fila.slice(0, 6).join("|");
}

function validarUnicidad(filas, tipo) {
  const claves = new Set();
  for (const fila of filas) {
    const clave = claveFila(fila);
    if (claves.has(clave)) {
      throw new Error(`Tarifa ${tipo} duplicada: ${clave}`);
    }
    claves.add(clave);
  }
}

function main() {
  const [cotizador, adultosProtect, dependientesProtect, salida] = process.argv.slice(2);
  if (!cotizador || !adultosProtect || !dependientesProtect || !salida) {
    throw new Error(
      "Uso: node scripts/generarCatalogoTarifas.js <cotizador.xlsx> <adultos-protect.xlsm> <dependientes-protect.xlsx> <salida.json>",
    );
  }

  const libroBase = XLSX.readFile(cotizador);
  const adultosBase = filasCompletas(libroBase.Sheets["Tarifa Adultos"])
    .filter((fila) => normalizarPlan(fila[2]) !== "Protect")
    .map((fila) => [
      Number(fila[0]),
      normalizarPais(fila[1]),
      normalizarPlan(fila[2]),
      normalizarRed(fila[3]),
      Number(fila[4]),
      Number(fila[5]),
      Number(fila[6]),
    ]);
  const dependientesBase = filasCompletas(libroBase.Sheets["Tarifa Hijos"]).map(
    (fila) => [
      Number(fila[0]),
      normalizarPais(fila[1]),
      normalizarPlan(fila[2]),
      normalizarRed(fila[3]),
      Number(fila[4]),
      Number(fila[5]),
      Number(fila[6]),
    ],
  );

  const libroAdultosProtect = XLSX.readFile(adultosProtect);
  const filasAdultosProtect = libroAdultosProtect.SheetNames.flatMap((hoja) =>
    filasCompletas(libroAdultosProtect.Sheets[hoja]).map((fila) => [
      Number(fila[0]),
      normalizarPais(fila[1]),
      "Protect",
      normalizarRed(fila[3]),
      Number(fila[4]),
      Number(fila[5]),
      Number(fila[6]),
    ]),
  );

  const libroDependientesProtect = XLSX.readFile(dependientesProtect);
  const filasDependientesProtect = filasCompletas(
    libroDependientesProtect.Sheets[libroDependientesProtect.SheetNames[0]],
  ).map((fila) => [
    Number(fila[0]),
    normalizarPais(fila[1]),
    "Protect",
    normalizarRed(fila[3]),
    Number(fila[4]),
    Number(fila[5]),
    Number(fila[6]),
  ]);

  const adultos = [...adultosBase, ...filasAdultosProtect];
  const dependientes = [...dependientesBase, ...filasDependientesProtect];
  validarUnicidad(adultos, "de adulto");
  validarUnicidad(dependientes, "de dependientes");

  const catalogo = {
    metadata: {
      version: VERSION_TARIFAS,
      vigenteDesde: "2026-12-01",
      moneda: "USD",
      recargoMensual: 0.08,
      tolerancia: 0.01,
      conteos: {
        adultos: adultos.length,
        dependientes: dependientes.length,
      },
      fuentes: [
        { archivo: path.basename(cotizador), sha256: sha256(cotizador) },
        { archivo: path.basename(adultosProtect), sha256: sha256(adultosProtect) },
        {
          archivo: path.basename(dependientesProtect),
          sha256: sha256(dependientesProtect),
        },
      ],
    },
    reglas: {
      paisesDirectosProtect: PAISES_DIRECTOS_PROTECT,
      zonaCaribeProtect: "CARIBE",
      zonaCaribeDependientesPlanesAnteriores: "CARIBBEAN",
      redSinCoberturaEstadosUnidos: "LATAM",
      frecuencias: {
        Anual: { recargo: 0, recibos: 1 },
        Semestral: { recargo: 0, recibos: 2 },
        Trimestral: { recargo: 0, recibos: 4 },
        Mensual: { recargo: 0.08, recibos: 12 },
      },
    },
    adultos,
    dependientes,
  };

  if (adultos.length !== 92808 || dependientes.length !== 4572) {
    throw new Error(
      `Conteos inesperados: adultos=${adultos.length}; dependientes=${dependientes.length}`,
    );
  }

  mkdirSync(path.dirname(salida), { recursive: true });
  writeFileSync(salida, `${JSON.stringify(catalogo)}\n`, "utf8");
  process.stdout.write(
    `Catálogo ${VERSION_TARIFAS}: ${adultos.length} tarifas de adulto y ${dependientes.length} de dependientes.\n`,
  );
}

main();
