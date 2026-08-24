import { EscenarioExcel } from "../types/EscenarioExcel";

interface SelectorEscenarioCI {
  perfil: string;
  configuracion: string;
  idioma: EscenarioExcel["IdiomaCotizacion"];
}

interface SelectorNightlyCI extends SelectorEscenarioCI {
  slot: 1 | 2 | 3 | 4;
}

const ESCENARIOS_SMOKE: SelectorEscenarioCI[] = [
  {
    perfil: "Individual Normal",
    configuracion: "Superior Ultra Anual",
    idioma: "Esp",
  },
  {
    perfil: "Familiar Conyuge 1 Dependiente Titular Rechazo BMI",
    configuracion: "Superior Ultra Anual",
    idioma: "Eng",
  },
];

/**
 * Catálogo crítico rotativo. En ocho casos cubre los ocho perfiles, las ocho
 * combinaciones plan/red, las cuatro frecuencias/deducibles, los tres idiomas,
 * emisión y evaluación BMI. Cada ejecución diaria consume únicamente el slot
 * solicitado.
 */
const ESCENARIOS_NIGHTLY: SelectorNightlyCI[] = [
  {
    slot: 1,
    perfil: "Familiar Conyuge 1 Dependiente Normal",
    configuracion: "Superior Ultra Anual",
    idioma: "Esp",
  },
  {
    slot: 1,
    perfil: "Individual Rechazo BMI",
    configuracion: "Protect Core Trimestral",
    idioma: "Eng",
  },
  {
    slot: 2,
    perfil: "Familiar Conyuge 2 Dependientes Normal",
    configuracion: "Optima Plus Semestral",
    idioma: "Eng",
  },
  {
    slot: 2,
    perfil: "Familiar Conyuge 1 Dependiente Titular Rechazo BMI",
    configuracion: "Superior Open Mensual",
    idioma: "Port",
  },
  {
    slot: 3,
    perfil: "Familiar Conyuge 3+ Dependientes Normal",
    configuracion: "Vital Core Trimestral",
    idioma: "Port",
  },
  {
    slot: 3,
    perfil: "Familiar Conyuge 2 Dependientes Titular Rechazo BMI",
    configuracion: "Optima Ultra Anual",
    idioma: "Esp",
  },
  {
    slot: 4,
    perfil: "Individual Normal",
    configuracion: "Protect Sin cobertura dentro de EE. UU. Mensual",
    idioma: "Esp",
  },
  {
    slot: 4,
    perfil: "Familiar Conyuge 3+ Dependientes Titular Rechazo BMI",
    configuracion: "Vital Plus Semestral",
    idioma: "Eng",
  },
];

const ESCENARIO_INTEGRACION_CLAIMS: SelectorEscenarioCI = {
  perfil: "Familiar Conyuge 1 Dependiente Normal",
  configuracion: "Superior Ultra Anual",
  idioma: "Esp",
};

const ESCENARIO_TARIFA_CRITICA: SelectorEscenarioCI = {
  perfil: "Individual Normal",
  configuracion: "Superior Ultra Anual",
  idioma: "Esp",
};

function coincide(
  escenario: EscenarioExcel,
  selector: SelectorEscenarioCI,
) {
  return (
    escenario.PerfilCotizacion === selector.perfil &&
    escenario.ConfiguracionPlan === selector.configuracion &&
    escenario.IdiomaCotizacion === selector.idioma
  );
}

export function obtenerTagsAplicacionCI(escenario: EscenarioExcel) {
  const tags: string[] = [];

  if (ESCENARIOS_SMOKE.some((selector) => coincide(escenario, selector))) {
    tags.push("@smoke");
  }

  const selectorNightly = ESCENARIOS_NIGHTLY.find((selector) =>
    coincide(escenario, selector),
  );
  if (selectorNightly) {
    tags.push(`@nightly-${selectorNightly.slot}`);
  }

  return tags;
}

export function obtenerTagsEmisionClaimsCI(
  escenarioClaims: string,
  escenario: EscenarioExcel,
) {
  return escenarioClaims === "Emision 1" &&
    coincide(escenario, ESCENARIO_INTEGRACION_CLAIMS)
    ? ["@integracion-ci"]
    : [];
}

export function obtenerTagsTarifasCI(escenario: EscenarioExcel) {
  return coincide(escenario, ESCENARIO_TARIFA_CRITICA)
    ? ["@tarifa-ci"]
    : [];
}

export function esEscenarioTarifaCriticaCI(escenario: EscenarioExcel) {
  return coincide(escenario, ESCENARIO_TARIFA_CRITICA);
}
