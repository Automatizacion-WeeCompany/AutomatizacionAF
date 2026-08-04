import { test } from "@playwright/test";
import {
  EmisionClaimsAfFlow,
  InicioSesionEmisionClaimsAfFlow,
} from "../flows/emisionClaimsAf.flow";
import { EscenarioEmisionExcel } from "../types/EscenarioExcel";
import { ExtraerDatosExcel } from "../utilidades/ObtencionDeDatos";

const escenarios: EscenarioEmisionExcel[] =
  ExtraerDatosExcel.obtenerEscenariosPorHoja("EmisionAF");

test.describe("Emision Claims AF", () => {
  for (const escenario of escenarios.filter(
    (registro) => registro.EscenarioPrueba,
  )) {
    test(`Escenario: ${escenario.EscenarioPrueba}`, async ({ page }) => {
      const inicioSesion = new InicioSesionEmisionClaimsAfFlow(page);
      const emisionClaims = new EmisionClaimsAfFlow(page);

      await inicioSesion.inicioSesionEmisionClaimsAf(
        escenario.UrlClaims,
        escenario.CorreoClaims,
        escenario.ContrasenaClaims.toString(),
      );
      await emisionClaims.emisionClaimsAf(
        escenario.FolioSolicitante.toString(),
      );
      await page.waitForTimeout(10000);
    });
  }
});
