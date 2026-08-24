import { BrowserContext, expect, test } from "@playwright/test";
import {
  esEscenarioTarifaCriticaCI,
  obtenerTagsTarifasCI,
} from "../../configuraciones/escenariosCI";
import { ValidacionTarifasAFFlow } from "../../flows/validacionTarifasAF.flow";
import {
  OpcionPaisResidencia,
  ResultadoValidacionTarifa,
} from "../../types/ValidacionTarifas";
import {
  generarEscenariosValidacionTarifas,
  obtenerVarianteValidacionTarifa,
} from "../../utilidades/GenerarMatrizValidacionTarifas";
import { ExtraerDatosExcel } from "../../utilidades/ObtencionDeDatos";
import { ReporteValidacionTarifas } from "../../utilidades/ReporteValidacionTarifas";
import {
  folioCaso,
  tagPorIdioma,
  tagsPorTipoPoliza,
} from "../soporte/escenariosCotizador";

const escenarios = generarEscenariosValidacionTarifas(
  ExtraerDatosExcel.obtenerEscenariosCotizador(),
);
const ejecucionTarifasAcotada =
  process.env.CI_PROFILE === "tarifas" ||
  process.env.CI_TARIFA_ACOTADA === "1";
const escenariosReporte = ejecucionTarifasAcotada
  ? escenarios.filter(esEscenarioTarifaCriticaCI)
  : escenarios;
const viewport = { width: 1280, height: 720 };

function seleccionarMuestraEquidistante<T>(valores: T[], limite: number) {
  if (limite <= 0 || limite >= valores.length) {
    return valores;
  }
  if (limite === 1) {
    return [valores[0]];
  }

  const indices = new Set(
    Array.from({ length: limite }, (_, indice) =>
      Math.round((indice * (valores.length - 1)) / (limite - 1)),
    ),
  );
  return [...indices].map((indice) => valores[indice]);
}

test.describe("05. Matriz comercial", { tag: "@matriz" }, () => {
  test.describe("Tarifas por país", { tag: "@tarifas" }, () => {
    let paises: OpcionPaisResidencia[] = [];
    let reporte: ReporteValidacionTarifas | undefined;

    test.beforeAll(async ({ browser }, testInfo) => {
      const contexto = await browser.newContext({ viewport });
      const pagina = await contexto.newPage();
      pagina.setDefaultTimeout(30000);
      pagina.setDefaultNavigationTimeout(60000);

      try {
        const catalogoPaises = await new ValidacionTarifasAFFlow(
          pagina,
        ).obtenerCatalogoPaises(escenarios[0]);
        const limitePaises = Number.parseInt(
          process.env.CI_TARIFA_MAX_PAISES ?? "0",
          10,
        );
        paises = seleccionarMuestraEquidistante(
          catalogoPaises,
          Number.isInteger(limitePaises) ? limitePaises : 0,
        );
      } finally {
        await contexto.close();
      }

      reporte = await ReporteValidacionTarifas.crear(
        testInfo.project.name,
        testInfo.workerIndex,
        paises,
        escenariosReporte,
      );
    });

    test.afterAll(async () => {
      const resumen = await reporte?.finalizar();
      if (!resumen) {
        return;
      }

      const hallazgos =
        resumen.sinTarifa +
        resumen.evaluacionesBMI +
        resumen.errores +
        resumen.casosFaltantes +
        resumen.casosDuplicados;
      expect(
        hallazgos,
        `Validación de tarifas con hallazgos. Sin tarifa: ${resumen.sinTarifa}; BMI: ${resumen.evaluacionesBMI}; errores: ${resumen.errores}. Consulte ${reporte?.rutas.reporteJson}`,
      ).toBe(0);
    });

    for (const [indiceEscenario, escenario] of escenarios.entries()) {
      const id = folioCaso("MAT-TAR", indiceEscenario);

      test(
        `${id} | ${escenario.TipoPoliza} con ${escenario.ConfiguracionPlan} → tarifa positiva en cada país`,
        {
          tag: [
            tagsPorTipoPoliza(escenario),
            tagPorIdioma(escenario),
            ...obtenerTagsTarifasCI(escenario),
          ],
        },
        async ({ browser }) => {
          test.setTimeout(0);
          test.info().annotations.push(
            {
              type: "propósito",
              description:
                "Validar la tarifa de la variante comercial en todos los países disponibles.",
            },
            {
              type: "valida",
              description:
                "Tarifa positiva, ausencia de evaluación BMI y folio final por país.",
            },
            {
              type: "variante",
              description: escenario.EscenarioPrueba,
            },
          );

          if (!reporte) {
            throw new Error(
              "El reporte de validación de tarifas no fue inicializado",
            );
          }

          const resultados: ResultadoValidacionTarifa[] = [];
          for (const [indicePais, pais] of paises.entries()) {
            const resultado = await test.step(
              `${pais.texto} | ${escenario.TipoPoliza}`,
              async () => {
                const inicio = Date.now();
                let contexto: BrowserContext | undefined;

                try {
                  contexto = await browser.newContext({ viewport });
                  const pagina = await contexto.newPage();
                  pagina.setDefaultTimeout(30000);
                  pagina.setDefaultNavigationTimeout(60000);
                  return await new ValidacionTarifasAFFlow(pagina).ejecutar(
                    escenario,
                    pais,
                    indiceEscenario * paises.length + indicePais + 1,
                  );
                } catch (error) {
                  return {
                    idCaso: `${pais.valor}::${escenario.PerfilCotizacion}::${escenario.ConfiguracionPlan}::${escenario.IdiomaCotizacion}`,
                    fechaHora: new Date().toISOString(),
                    duracionMs: Date.now() - inicio,
                    pais,
                    variante: obtenerVarianteValidacionTarifa(escenario),
                    estado: "Error",
                    detalle:
                      error instanceof Error ? error.message : String(error),
                  } satisfies ResultadoValidacionTarifa;
                } finally {
                  await contexto?.close().catch(() => undefined);
                }
              },
            );

            resultados.push(resultado);
            await reporte.registrar(resultado);
          }

          const hallazgos = resultados.filter(
            (resultado) => resultado.estado !== "Exitosa",
          ).length;
          test.info().annotations.push({
            type: "casos-pais",
            description: `${resultados.length} ejecutados; ${hallazgos} con hallazgos`,
          });
        },
      );
    }
  });
});
