import { Page } from "@playwright/test";
import { EscenarioExcel } from "../types/EscenarioExcel";
import {
  CotizacionAFBaseFlow,
  ResultadoEjecucionCotizacion,
} from "./cotizacionAFBase.flow";

export class CotizacionIndividualAFFlow {
  private readonly flujoBase: CotizacionAFBaseFlow;

  constructor(page: Page) {
    this.flujoBase = new CotizacionAFBaseFlow(page);
  }

  ejecutar(
    escenario: EscenarioExcel,
    numeroFlujo: number,
  ): Promise<ResultadoEjecucionCotizacion> {
    if (escenario.TipoPoliza !== "Individual") {
      throw new Error(
        `CotizacionIndividualAFFlow recibió una póliza ${escenario.TipoPoliza}`,
      );
    }

    return this.flujoBase.ejecutar(escenario, numeroFlujo);
  }
}
