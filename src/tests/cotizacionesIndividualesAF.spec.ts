import { test } from "@playwright/test";
import { CotizacionIndividualAFFlow } from "../flows/cotizacionIndividualAF.flow";
import { ExtraerDatosExcel } from "../utilidades/ObtencionDeDatos";

const escenarios = ExtraerDatosExcel.obtenerEscenariosCotizador();

test.describe("Cotizaciones individuales AF", () => {
  for (const [indice, escenario] of escenarios.entries()) {
    if (escenario.TipoPoliza !== "Individual") {
      continue;
    }

    const numeroFlujo = indice + 1;
    test(`Escenario: ${escenario.EscenarioPrueba} ${escenario.IdiomaCotizacion}`, async ({
      page,
    }) => {
      const cotizacionIndividual = new CotizacionIndividualAFFlow(page);
      await cotizacionIndividual.ejecutar(escenario, numeroFlujo);
    });
  }
});
