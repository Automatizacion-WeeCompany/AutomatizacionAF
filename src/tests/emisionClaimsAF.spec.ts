import { expect, test } from "@playwright/test";
import { esEscenarioEmisionCI } from "../configuraciones/escenariosCI";
import { CotizacionFamiliarAFFlow } from "../flows/cotizacionFamiliarAF.flow";
import { CotizacionIndividualAFFlow } from "../flows/cotizacionIndividualAF.flow";
import {
  EmisionClaimsAfFlow,
  InicioSesionEmisionClaimsAfFlow,
} from "../flows/emisionClaimsAf.flow";
import { EscenarioEmisionExcel } from "../types/EscenarioExcel";
import { ExtraerDatosExcel } from "../utilidades/ObtencionDeDatos";

const escenarios: EscenarioEmisionExcel[] =
  ExtraerDatosExcel.obtenerEscenariosPorHoja("EmisionAF");
const escenariosCotizador = ExtraerDatosExcel.obtenerEscenariosCotizador();

test.describe("Emision Claims AF", () => {
  for (const escenarioClaims of escenarios.filter(
    (registro) => registro.EscenarioPrueba,
  )) {
    for (const [indice, escenarioCotizacion] of escenariosCotizador.entries()) {
      if (escenarioCotizacion.ResultadoEsperado !== "Emision") {
        continue;
      }

      const numeroFlujo = indice + 1;
      test(`Escenario: ${escenarioClaims.EscenarioPrueba} | ${escenarioCotizacion.EscenarioPrueba}`, {
        tag: esEscenarioEmisionCI(
          escenarioClaims.EscenarioPrueba,
          escenarioCotizacion.EscenarioPrueba,
        )
          ? "@ci"
          : [],
      }, async ({ page }) => {
        const cotizador =
          escenarioCotizacion.TipoPoliza === "Familiar"
            ? new CotizacionFamiliarAFFlow(page)
            : new CotizacionIndividualAFFlow(page);
        const resultadoCotizacion = await cotizador.ejecutar(
          escenarioCotizacion,
          numeroFlujo,
        );

        if (resultadoCotizacion.resultado !== "Emision") {
          throw new Error(
            `La cotización no generó una póliza: ${escenarioCotizacion.EscenarioPrueba}`,
          );
        }

        // El contexto conserva las entradas y selecciones reales para las
        // comparaciones que se agregarán en las siguientes etapas del flujo.
        const datosCotizacion = resultadoCotizacion.datosCotizacion;
        expect(datosCotizacion.campos.length).toBeGreaterThan(0);
        expect(datosCotizacion.numeroPoliza).toBe(
          resultadoCotizacion.numeroPoliza,
        );
        const inicioSesion = new InicioSesionEmisionClaimsAfFlow(page);
        const emisionClaims = new EmisionClaimsAfFlow(page);

        await inicioSesion.inicioSesionEmisionClaimsAf(
          escenarioClaims.UrlClaims,
          escenarioClaims.CorreoClaims,
          escenarioClaims.ContrasenaClaims.toString(),
        );
        const comparacion = await emisionClaims.emisionClaimsAf(
          datosCotizacion,
        );
        expect(comparacion.resultado.resumen.diferentes).toBe(0);
        expect(comparacion.resultado.pestanas).toHaveLength(7);
      });
    }
  }
});
