import { expect, test } from "@playwright/test";
import {
  esEscenarioTarifaCriticaCI,
  obtenerTagsAplicacionCI,
  obtenerTagsEmisionClaimsCI,
} from "../../configuraciones/escenariosCI";
import { ExtraerDatosExcel } from "../../utilidades/ObtencionDeDatos";

const escenarios = ExtraerDatosExcel.obtenerEscenariosCotizador();

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe("Perfiles de ejecución CI/CD", { tag: "@perfil-ci" }, () => {
    test("REG-CI-001 | Smoke → conserva emisión y evaluación BMI", () => {
      const smoke = escenarios.filter((escenario) =>
        obtenerTagsAplicacionCI(escenario).includes("@smoke"),
      );

      expect(smoke).toHaveLength(2);
      expect(new Set(smoke.map(({ ResultadoEsperado }) => ResultadoEsperado))).toEqual(
        new Set(["Emision", "EvaluacionBMI"]),
      );
      expect(new Set(smoke.map(({ TipoPoliza }) => TipoPoliza))).toEqual(
        new Set(["Familiar", "Individual"]),
      );
    });

    test("REG-CI-002 | Nightly rotativo → cubre todos los ejes críticos", () => {
      const nightly = escenarios.filter((escenario) =>
        obtenerTagsAplicacionCI(escenario).some((tag) =>
          /^@nightly-[1-4]$/.test(tag),
        ),
      );

      expect(nightly).toHaveLength(8);
      expect(new Set(nightly.map(({ PerfilCotizacion }) => PerfilCotizacion)).size).toBe(8);
      expect(
        new Set(
          nightly.map(
            ({ CotizarPlan, RedProveedores }) =>
              `${CotizarPlan}|${RedProveedores}`,
          ),
        ).size,
      ).toBe(8);
      expect(new Set(nightly.map(({ FrecuenciaPago }) => FrecuenciaPago))).toEqual(
        new Set(["Anual", "Semestral", "Trimestral", "Mensual"]),
      );
      expect(new Set(nightly.map(({ Deducible }) => Deducible))).toEqual(
        new Set([
          "$1,000.00 / $3,000.00 USD",
          "$2,000.00 / $4,000.00 USD",
          "$5,000.00 / $5,000.00 USD",
          "$5,000.00 / $7,500.00 USD",
        ]),
      );
      expect(
        new Set(nightly.map(({ IdiomaCotizacion }) => IdiomaCotizacion)),
      ).toEqual(new Set(["Esp", "Eng", "Port"]));
      expect(
        new Set(nightly.map(({ ResultadoEsperado }) => ResultadoEsperado)),
      ).toEqual(new Set(["Emision", "EvaluacionBMI"]));
      expect(new Set(nightly.map(({ TipoPoliza }) => TipoPoliza))).toEqual(
        new Set(["Familiar", "Individual"]),
      );

      for (const slot of [1, 2, 3, 4]) {
        expect(
          nightly.filter((escenario) =>
            obtenerTagsAplicacionCI(escenario).includes(`@nightly-${slot}`),
          ),
        ).toHaveLength(2);
      }
    });

    test("REG-CI-003 | Integración Claims → selecciona un único familiar", () => {
      const integracion = escenarios.filter((escenario) =>
        obtenerTagsEmisionClaimsCI("Emision 1", escenario).includes(
          "@integracion-ci",
        ),
      );

      expect(integracion).toHaveLength(1);
      expect(integracion[0].TipoPoliza).toBe("Familiar");
      expect(integracion[0].ResultadoEsperado).toBe("Emision");
    });

    test("REG-CI-004 | Tarifa crítica → selecciona una emisión individual", () => {
      const tarifas = escenarios.filter(esEscenarioTarifaCriticaCI);

      expect(tarifas).toHaveLength(1);
      expect(tarifas[0].TipoPoliza).toBe("Individual");
      expect(tarifas[0].ResultadoEsperado).toBe("Emision");
    });
  });
});
