const ETIQUETAS_PAISES: Record<string, string[]> = {
  AI: ["AI", "Anguila", "Anguilla"],
  AG: ["AG", "Antigua y Barbuda", "Antigua and Barbuda"],
  AR: ["AR", "Argentina"],
  AW: ["AW", "Aruba"],
  BS: ["BS", "Bahamas", "Las Bahamas"],
  BO: ["BO", "Bolivia", "Estado Plurinacional de Bolivia"],
  BR: ["BR", "Brasil", "Brazil"],
  CL: ["CL", "Chile"],
  CO: ["CO", "Colombia"],
  CR: ["CR", "Costa Rica"],
  CW: ["CW", "Curazao", "Curaçao", "Curaçau", "Curacao"],
  DM: ["DM", "Dominica"],
  SV: ["SV", "El Salvador"],
  GD: ["GD", "Granada", "Grenada"],
  GP: ["GP", "Guadalupe", "Guadeloupe"],
  GT: ["GT", "Guatemala"],
  HN: ["HN", "Honduras"],
  KY: ["KY", "Islas Caimán", "Islas Caiman", "Cayman Islands"],
  TC: [
    "TC",
    "Islas Turcas y Caicos",
    "Turks and Caicos Islands",
    "Ilhas Turcas e Caicos",
  ],
  VG: [
    "VG",
    "Islas Vírgenes Británicas",
    "Islas Virgenes (Britanicas)",
    "British Virgin Islands",
    "Ilhas Virgens Britânicas",
  ],
  JM: ["JM", "Jamaica"],
  MQ: ["MQ", "Martinica", "Martinique"],
  MX: ["MX", "México", "Mexico"],
  MS: ["MS", "Montserrat"],
  NI: ["NI", "Nicaragua"],
  PA: ["PA", "Panamá", "Panama"],
  PY: ["PY", "Paraguay"],
  PE: ["PE", "Perú", "Peru"],
  DO: ["DO", "República Dominicana", "Dominican Republic"],
  BL: ["BL", "San Bartolomé", "Saint Barthélemy", "Saint Barthelemy"],
  KN: [
    "KN",
    "San Cristóbal y Nieves",
    "San Kitts y Nevis",
    "Saint Kitts and Nevis",
  ],
  BQ: [
    "BQ",
    "Bonaire, San Eustaquio y Saba",
    "Bonaire, Sint Eustatius and Saba",
    "Sint Eustatius and Saba, Bonaire",
    "Países Baixos Caribenhos",
  ],
  MF: [
    "MF",
    "San Martín (parte francesa)",
    "Saint Martin (French part)",
    "Saint Martin French",
    "São Martinho",
  ],
  VC: [
    "VC",
    "San Vicente y las Granadinas",
    "Saint Vincent and the Grenadines",
  ],
  LC: ["LC", "Santa Lucía", "Saint Lucia"],
  TT: ["TT", "Trinidad y Tobago", "Trinidad and Tobago"],
  UY: ["UY", "Uruguay"],
};

export const CODIGOS_PAISES_TARIFAS = Object.freeze(
  Object.keys(ETIQUETAS_PAISES),
);

export function normalizarTextoTarifa(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
}

const CODIGO_POR_ETIQUETA = new Map<string, string>(
  Object.entries(ETIQUETAS_PAISES).flatMap(([codigo, etiquetas]) =>
    etiquetas.map((etiqueta) => [normalizarTextoTarifa(etiqueta), codigo]),
  ),
);

interface ConstructorDisplayNames {
  new (
    locales: string[],
    opciones: { type: "region" },
  ): { of(codigo: string): string | undefined };
}

const ConstructorDisplayNames = (
  Intl as unknown as { DisplayNames?: ConstructorDisplayNames }
).DisplayNames;

if (ConstructorDisplayNames) {
  for (const idioma of ["es", "en", "pt"]) {
    const nombres = new ConstructorDisplayNames([idioma], { type: "region" });
    for (const codigo of CODIGOS_PAISES_TARIFAS) {
      const etiqueta = nombres.of(codigo);
      if (etiqueta) {
        CODIGO_POR_ETIQUETA.set(normalizarTextoTarifa(etiqueta), codigo);
      }
    }
  }
}

export function normalizarPaisTarifa(valor: string) {
  const codigo = CODIGO_POR_ETIQUETA.get(normalizarTextoTarifa(valor));
  if (!codigo) {
    throw new Error(
      `El país "${valor}" no tiene equivalencia en el catálogo de tarifas 2026-12`,
    );
  }
  return codigo;
}
