import { Page } from "@playwright/test";
import { EscenarioExcel } from "../types/EscenarioExcel";
import {
  CotizacionAFBaseFlow,
  ResultadoEjecucionCotizacion,
} from "./cotizacionAFBase.flow";

export class CotizacionFamiliarAFFlow {
  private readonly flujoBase: CotizacionAFBaseFlow;

  constructor(page: Page) {
    this.flujoBase = new CotizacionAFBaseFlow(page);
  }

  ejecutar(
    escenario: EscenarioExcel,
    numeroFlujo: number,
  ): Promise<ResultadoEjecucionCotizacion> {
    if (escenario.TipoPoliza !== "Familiar") {
      throw new Error(
        `CotizacionFamiliarAFFlow recibió una póliza ${escenario.TipoPoliza}`,
      );
    }

    return this.flujoBase.ejecutar(escenario, numeroFlujo);
  }
}
