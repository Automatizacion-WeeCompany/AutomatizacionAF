import { expect, test } from "@playwright/test";
import { obtenerTagsEmisionClaimsCI } from "../../../configuraciones/escenariosCI";
import {
  EmisionClaimsAfFlow,
  InicioSesionEmisionClaimsAfFlow,
} from "../../../flows/emisionClaimsAf.flow";
import { EscenarioEmisionExcel } from "../../../types/EscenarioExcel";
import { ExtraerDatosExcel } from "../../../utilidades/ObtencionDeDatos";
import {
  crearFlowCotizacion,
  describirComposicion,
  folioCaso,
  tagPorIdioma,
  tagsPorTipoPoliza,
} from "../../soporte/escenariosCotizador";

const escenariosClaims: EscenarioEmisionExcel[] =
  ExtraerDatosExcel.obtenerEscenariosPorHoja("EmisionAF").filter(
    (registro) => registro.EscenarioPrueba,
  );
const escenariosCotizador = ExtraerDatosExcel.obtenerEscenariosCotizador();
const casosEmision = escenariosCotizador
  .map((escenario, indiceOriginal) => ({ escenario, indiceOriginal }))
  .filter(({ escenario }) => escenario.ResultadoEsperado === "Emision");

test.describe(
  "03. Integración Aplicación → WeeClaims",
  { tag: ["@integracion", "@weeclaims"] },
  () => {
    test.describe("Emisión y comparación de póliza", { tag: "@emision" }, () => {
      for (const [indiceClaims, escenarioClaims] of escenariosClaims.entries()) {
        for (const [indiceCaso, { escenario, indiceOriginal }] of casosEmision.entries()) {
          const id = folioCaso(
            "INT-CLAIMS-EMI",
            indiceClaims * casosEmision.length + indiceCaso,
          );
          const tags = [
            tagsPorTipoPoliza(escenario),
            tagPorIdioma(escenario),
            ...obtenerTagsEmisionClaimsCI(
              escenarioClaims.EscenarioPrueba,
              escenario,
            ),
          ];

          test(
            `${id} | ${describirComposicion(escenario)} emitida → comparación y aceptación en WeeClaims | ${escenario.ConfiguracionPlan}`,
            { tag: tags },
            async ({ page }) => {
              test.info().annotations.push(
                { type: "hu", description: "HU 6" },
                {
                  type: "propósito",
                  description:
                    "Demostrar que la póliza creada en AF conserva sus datos y puede atenderse en WeeClaims.",
                },
                {
                  type: "valida",
                  description:
                    "Siete pestañas sin diferencias, aceptación enviada y sin pendientes finales.",
                },
                {
                  type: "variante",
                  description: `${escenarioClaims.EscenarioPrueba} | ${escenario.EscenarioPrueba}`,
                },
              );

              const resultadoCotizacion = await crearFlowCotizacion(
                page,
                escenario,
              ).ejecutar(escenario, indiceOriginal + 1);

              if (resultadoCotizacion.resultado !== "Emision") {
                throw new Error(
                  `La cotización no generó una póliza: ${escenario.EscenarioPrueba}`,
                );
              }

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
              const resultadoEmision = await emisionClaims.emisionClaimsAf(
                datosCotizacion,
                escenarioClaims.ContrasenaClaims.toString(),
              );
              expect(
                resultadoEmision.comparacion.resultado.resumen.diferentes,
              ).toBe(0);
              expect(
                resultadoEmision.comparacion.resultado.pestanas,
              ).toHaveLength(7);
              expect(resultadoEmision.aceptacion.resultado.estado).toBe(
                "AceptacionEnviada",
              );
              expect(
                resultadoEmision.aceptacion.resultado.pendientesFinales,
              ).toHaveLength(0);
            },
          );
        }
      }
    });
  },
);
