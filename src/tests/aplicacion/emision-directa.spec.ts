import { test } from "@playwright/test";
import { obtenerTagsAplicacionCI } from "../../configuraciones/escenariosCI";
import { ExtraerDatosExcel } from "../../utilidades/ObtencionDeDatos";
import {
  crearFlowCotizacion,
  describirComposicion,
  folioCaso,
  tagPorIdioma,
  tagsPorTipoPoliza,
} from "../soporte/escenariosCotizador";

const casos = ExtraerDatosExcel.obtenerEscenariosCotizador()
  .map((escenario, indiceOriginal) => ({ escenario, indiceOriginal }))
  .filter(({ escenario }) => escenario.ResultadoEsperado === "Emision");

test.describe("02. Aplicación AF", { tag: "@e2e" }, () => {
  test.describe("Emisión directa", { tag: "@emision" }, () => {
    for (const [indiceCaso, { escenario, indiceOriginal }] of casos.entries()) {
      const id = folioCaso("APP-EMI", indiceCaso);
      const composicion = describirComposicion(escenario);
      const tags = [
        tagsPorTipoPoliza(escenario),
        tagPorIdioma(escenario),
        ...obtenerTagsAplicacionCI(escenario),
      ];

      test(
        `${id} | ${composicion} sin criterio de suscripción → emisión y pago | ${escenario.ConfiguracionPlan} | ${escenario.IdiomaCotizacion}`,
        { tag: tags },
        async ({ page }) => {
          test.info().annotations.push(
            { type: "hu", description: "HU 6" },
            {
              type: "propósito",
              description:
                "Demostrar que una solicitud sin criterios de suscripción completa emisión y pago.",
            },
            {
              type: "valida",
              description:
                "Recorrido completo de aplicación, pago y generación de póliza.",
            },
            {
              type: "variante",
              description: escenario.EscenarioPrueba,
            },
          );

          await crearFlowCotizacion(page, escenario).ejecutar(
            escenario,
            indiceOriginal + 1,
          );
        },
      );
    }
  });
});
