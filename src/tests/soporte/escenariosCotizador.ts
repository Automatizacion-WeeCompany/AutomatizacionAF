import { Page } from "@playwright/test";
import { CotizacionFamiliarAFFlow } from "../../flows/cotizacionFamiliarAF.flow";
import { CotizacionIndividualAFFlow } from "../../flows/cotizacionIndividualAF.flow";
import { EscenarioExcel } from "../../types/EscenarioExcel";

export function crearFlowCotizacion(
  page: Page,
  escenario: EscenarioExcel,
) {
  return escenario.TipoPoliza === "Familiar"
    ? new CotizacionFamiliarAFFlow(page)
    : new CotizacionIndividualAFFlow(page);
}

export function describirComposicion(escenario: EscenarioExcel) {
  if (escenario.TipoPoliza === "Individual") {
    return "póliza Individual con titular";
  }

  const cantidad = String(escenario.HijosMenoresDe24 ?? "0");
  const dependientes = cantidad === "1" ? "1 dependiente" : `${cantidad} dependientes`;
  return `póliza Familiar con titular, cónyuge y ${dependientes}`;
}

export function folioCaso(prefijo: string, indice: number) {
  return `${prefijo}-${String(indice + 1).padStart(3, "0")}`;
}

export function tagsPorTipoPoliza(escenario: EscenarioExcel) {
  return escenario.TipoPoliza === "Familiar" ? "@familiar" : "@individual";
}

export function tagPorIdioma(escenario: EscenarioExcel) {
  return `@${escenario.IdiomaCotizacion.toLowerCase()}`;
}
