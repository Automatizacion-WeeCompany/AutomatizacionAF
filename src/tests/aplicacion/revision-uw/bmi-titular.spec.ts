import { test } from "@playwright/test";
import { obtenerTagsAplicacionCI } from "../../../configuraciones/escenariosCI";
import { ExtraerDatosExcel } from "../../../utilidades/ObtencionDeDatos";
import {
  crearFlowCotizacion,
  describirComposicion,
  folioCaso,
  tagPorIdioma,
  tagsPorTipoPoliza,
} from "../../soporte/escenariosCotizador";

const casos = ExtraerDatosExcel.obtenerEscenariosCotizador()
  .map((escenario, indiceOriginal) => ({ escenario, indiceOriginal }))
  .filter(({ escenario }) => escenario.ResultadoEsperado === "EvaluacionBMI");

test.describe("02. Aplicación AF", { tag: "@e2e" }, () => {
  test.describe("Revisión UW", { tag: "@uw" }, () => {
    test.describe("BMI del titular", { tag: ["@bmi", "@titular"] }, () => {
      for (const [indiceCaso, { escenario, indiceOriginal }] of casos.entries()) {
        const id = folioCaso("APP-UW-BMI", indiceCaso);
        const composicion = describirComposicion(escenario);
        const tags = [
          tagsPorTipoPoliza(escenario),
          tagPorIdioma(escenario),
          ...obtenerTagsAplicacionCI(escenario),
        ];

        test(
          `${id} | Titular adulto fuera de rango en ${composicion} → evaluación sin pago | ${escenario.ConfiguracionPlan} | ${escenario.IdiomaCotizacion}`,
          { tag: tags },
          async ({ page }) => {
            test.info().annotations.push(
              { type: "hu", description: "HU 2, HU 6" },
              {
                type: "propósito",
                description:
                  "Demostrar que el BMI fuera de rango del titular activa evaluación de suscripción.",
              },
              {
                type: "valida",
                description:
                  "Mensaje de evaluación BMI y finalización sin acceder al pago.",
              },
              {
                type: "no valida",
                description: "No representa un rechazo definitivo del titular.",
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
});
