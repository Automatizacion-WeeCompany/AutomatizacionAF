import { test } from "@playwright/test";
import { esEscenarioCotizadorCI } from "../configuraciones/escenariosCI";
import { CotizacionFamiliarAFFlow } from "../flows/cotizacionFamiliarAF.flow";
import { ExtraerDatosExcel } from "../utilidades/ObtencionDeDatos";

const escenarios = ExtraerDatosExcel.obtenerEscenariosCotizador();

test.describe("Cotizaciones familiares AF", () => {
  for (const [indice, escenario] of escenarios.entries()) {
    if (escenario.TipoPoliza !== "Familiar") {
      continue;
    }

    const numeroFlujo = indice + 1;
    test(`Escenario: ${escenario.EscenarioPrueba} ${escenario.IdiomaCotizacion}`, {
      tag: esEscenarioCotizadorCI(escenario.EscenarioPrueba) ? "@ci" : [],
    }, async ({ page }) => {
      const cotizacionFamiliar = new CotizacionFamiliarAFFlow(page);
      await cotizacionFamiliar.ejecutar(escenario, numeroFlujo);
    });
  }
});
