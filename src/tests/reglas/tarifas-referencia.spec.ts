import { expect, test } from "@playwright/test";
import { EscenarioExcel } from "../../types/EscenarioExcel";
import {
  CODIGOS_PAISES_TARIFAS,
  normalizarPaisTarifa,
} from "../../utilidades/NormalizarPaisTarifa";
import {
  calcularTarifaEsperada,
  compararTarifa,
  obtenerMetadatosCatalogoTarifas,
  TarifaNoCoincideError,
  validarTarifa,
} from "../../utilidades/ValidarTarifaAF";

function crearEscenario(
  cambios: Partial<EscenarioExcel> = {},
): EscenarioExcel {
  return {
    TipoPoliza: "Individual",
    ConyugePareja: "No",
    HijosMenoresDe24: "0",
    CotizarPlan: "Protect",
    RedProveedores: "Sin cobertura dentro de EE. UU.",
    Deducible: "$1,000.00 / $3,000.00 USD",
    FrecuenciaPago: "Anual",
    ...cambios,
  } as EscenarioExcel;
}

function entrada(
  escenario: EscenarioExcel,
  pais = "AR",
  edadTitular = 35,
  edadConyuge?: number,
) {
  return {
    escenario,
    pais: { valor: pais, texto: pais },
    edadTitular,
    edadConyuge,
  };
}

test.describe("Catálogo y cálculo de tarifas AF", () => {
  test("usa la versión aprobada y contiene los cuatro planes", () => {
    expect(obtenerMetadatosCatalogoTarifas()).toMatchObject({
      version: "2026-12",
      vigenteDesde: "2026-12-01",
      moneda: "USD",
      recargoMensual: 0.08,
      conteos: { adultos: 92808, dependientes: 4572 },
    });
  });

  test("reproduce el caso de control del cotizador y sólo aplica recargo mensual", () => {
    const escenario = crearEscenario({
      TipoPoliza: "Familiar",
      CotizarPlan: "Optima",
      RedProveedores: "Plus",
      Deducible: "$10,000.00 / $10,000.00 USD",
      FrecuenciaPago: "Mensual",
      HijosMenoresDe24: "3",
    });
    const calculo = calcularTarifaEsperada(entrada(escenario, "BR", 19));

    expect(calculo).toMatchObject({
      tarifaTitular: 1897,
      tarifaConyuge: 0,
      tarifaDependientes: 2235,
      montoBase: 4132,
      recargo: 0.08,
      montoRecargo: 330.56,
      montoAnual: 4462.56,
      recibos: 12,
      montoPorRecibo: 371.88,
    });
  });

  test("aplica el 8% mensual a todos los planes y 0% al resto de frecuencias", () => {
    const configuraciones = [
      ["Superior", "Open"],
      ["Optima", "Plus"],
      ["Vital", "Core"],
      ["Protect", "Sin cobertura dentro de EE. UU."],
    ];

    for (const [plan, red] of configuraciones) {
      const base = { CotizarPlan: plan, RedProveedores: red };
      const anual = calcularTarifaEsperada(
        entrada(crearEscenario({ ...base, FrecuenciaPago: "Anual" }), "BR"),
      );
      const mensual = calcularTarifaEsperada(
        entrada(crearEscenario({ ...base, FrecuenciaPago: "Mensual" }), "BR"),
      );

      expect(anual.recargo).toBe(0);
      expect(mensual.recargo).toBe(0.08);
      expect(mensual.montoAnual).toBe(
        Math.round(anual.montoBase * 1.08 * 100) / 100,
      );
      expect(mensual.montoPorRecibo).toBe(
        Math.round((mensual.montoAnual / 12) * 100) / 100,
      );
    }
  });

  test("resuelve Protect por país directo o zona CARIBE", () => {
    const escenario = crearEscenario();
    const argentina = calcularTarifaEsperada(entrada(escenario, "Argentina"));
    const antigua = calcularTarifaEsperada(
      entrada(escenario, "Antigua y Barbuda"),
    );

    expect(argentina).toMatchObject({ zonaAdultos: "AR", tarifaTitular: 1716 });
    expect(antigua).toMatchObject({
      zonaAdultos: "CARIBE",
      tarifaTitular: 2244,
    });
  });

  test("usa CARIBBEAN para dependientes de Turcas y Caicos en planes anteriores", () => {
    const calculo = calcularTarifaEsperada(
      entrada(
        crearEscenario({
          TipoPoliza: "Familiar",
          CotizarPlan: "Superior",
          RedProveedores: "Open",
          ConyugePareja: "No",
          HijosMenoresDe24: "2",
        }),
        "Islas Turcas y Caicos",
      ),
    );

    expect(calculo.zonaAdultos).toBe("TC");
    expect(calculo.zonaDependientes).toBe("CARIBBEAN");
    expect(calculo.tarifaDependientes).toBe(4990);
  });

  test("cubre todos los países, planes, redes y deducibles aprobados", () => {
    const configuraciones = [
      ["Superior", "Open"],
      ["Optima", "Plus"],
      ["Vital", "Core"],
      ["Protect", "Sin cobertura dentro de EE. UU."],
    ];
    const deducibles = [
      [1000, 3000],
      [2000, 4000],
      [5000, 5000],
      [5000, 7500],
      [10000, 10000],
      [20000, 20000],
    ];

    for (const pais of CODIGOS_PAISES_TARIFAS) {
      for (const [plan, red] of configuraciones) {
        for (const [fuera, dentro] of deducibles) {
          const escenario = crearEscenario({
            TipoPoliza: "Familiar",
            CotizarPlan: plan,
            RedProveedores: red,
            Deducible: `$${fuera} / $${dentro} USD`,
            ConyugePareja: "Si",
            HijosMenoresDe24: "2",
          });
          const calculo = calcularTarifaEsperada(
            entrada(escenario, pais, 35, 35),
          );
          expect(calculo.montoPorRecibo).toBeGreaterThan(0);
        }
      }
    }
  });

  test("normaliza etiquetas de país en español, inglés y portugués", () => {
    expect(normalizarPaisTarifa("México")).toBe("MX");
    expect(normalizarPaisTarifa("Brazil")).toBe("BR");
    expect(normalizarPaisTarifa("Curaçao")).toBe("CW");
    expect(normalizarPaisTarifa("Curaçau")).toBe("CW");
    expect(normalizarPaisTarifa("Ilhas Turcas e Caicos")).toBe("TC");
    expect(normalizarPaisTarifa("Bonaire, Sint Eustatius and Saba")).toBe("BQ");
    expect(normalizarPaisTarifa("Saint Martin (French part)")).toBe("MF");
  });

  test("acepta una diferencia de un centavo y diagnostica diferencias mayores", () => {
    const datos = entrada(crearEscenario(), "AR");
    const esperado = calcularTarifaEsperada(datos).montoPorRecibo;

    expect(
      compararTarifa(datos, {
        texto: `$${(esperado + 0.01).toFixed(2)} USD`,
        monto: esperado + 0.01,
        valoresVisibles: [],
        selector: '#tarifa-prueba',
      }).coincide,
    ).toBe(true);

    expect(() =>
      validarTarifa(datos, {
        texto: `$${(esperado + 1).toFixed(2)} USD`,
        monto: esperado + 1,
        valoresVisibles: [],
        selector: '#tarifa-prueba',
      }),
    ).toThrow(TarifaNoCoincideError);
  });
});
