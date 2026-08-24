import { expect, test } from "@playwright/test";
import {
  calcularEvaluacionAntropometrica,
  evaluarSolicitud,
} from "../../utilidades/ReglasSuscripcion";
import {
  dependiente,
  FECHA_EVALUACION,
  solicitud,
  titular,
} from "./soporte/solicitudDecision";

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe("Antropometría", { tag: "@bmi" }, () => {
    test("REG-BMI-001 | Adulto con kg/cm → calcula BMI estándar", () => {
      const resultado = calcularEvaluacionAntropometrica(
        titular({
          medidas: {
            peso: 70,
            unidadPeso: "kg",
            estatura: 175,
            unidadEstatura: "cm",
          },
        }),
        FECHA_EVALUACION,
      );

      expect(resultado).toMatchObject({
        metodo: "BMIAdulto",
        pesoKg: 70,
        estaturaMetros: 1.75,
        bmi: 22.86,
        requiereTablaPercentiles: false,
      });
    });

    test("REG-BMI-002 | Adulto con lb/ft → convierte antes de calcular BMI", () => {
      const resultado = calcularEvaluacionAntropometrica(
        titular({
          medidas: {
            peso: 220,
            unidadPeso: "lb",
            estatura: 6,
            unidadEstatura: "ft",
          },
        }),
        FECHA_EVALUACION,
      );

      expect(resultado?.pesoKg).toBe(99.792);
      expect(resultado?.estaturaMetros).toBe(1.8288);
      expect(resultado?.bmi).toBe(29.84);
    });

    test(
      "REG-BMI-003 | Menor desde 24 meses → utiliza BMI pediátrico",
      { tag: "@dependiente" },
      () => {
        const resultado = calcularEvaluacionAntropometrica(
          dependiente({
            fechaNacimiento: new Date(2024, 7, 20),
            medidas: {
              peso: 13,
              unidadPeso: "kg",
              estatura: 90,
              unidadEstatura: "cm",
            },
          }),
          FECHA_EVALUACION,
        );
        expect(resultado).toMatchObject({
          metodo: "BMIPediatrico",
          requiereTablaPercentiles: true,
        });
        expect(resultado?.bmi).toBe(16.05);
      },
    );

    test(
      "REG-BMI-004 | Menor de 24 meses → utiliza percentil y no BMI tradicional",
      { tag: "@dependiente" },
      () => {
        const resultado = calcularEvaluacionAntropometrica(
          dependiente({
            fechaNacimiento: new Date(2024, 8, 20),
            medidas: {
              peso: 10,
              unidadPeso: "kg",
              estatura: 78,
              unidadEstatura: "cm",
              percentilCrecimiento: 50,
            },
          }),
          FECHA_EVALUACION,
        );
        expect(resultado).toMatchObject({
          metodo: "PercentilCrecimiento",
          percentilCrecimiento: 50,
          requiereTablaPercentiles: false,
        });
        expect(resultado?.bmi).toBeUndefined();
      },
    );

    for (const [indice, [nombre, asegurado]] of [
      [
        "adulto",
        titular({
          medidas: {
            peso: 180,
            unidadPeso: "kg",
            estatura: 180,
            unidadEstatura: "cm",
            resultadoRango: "FueraRango",
          },
        }),
      ],
      [
        "menor de 2 a 17 años",
        dependiente({
          medidas: {
            peso: 70,
            unidadPeso: "kg",
            estatura: 130,
            unidadEstatura: "cm",
            resultadoRango: "FueraRango",
          },
        }),
      ],
      [
        "menor de 24 meses",
        dependiente({
          fechaNacimiento: new Date(2025, 7, 20),
          medidas: {
            peso: 20,
            unidadPeso: "kg",
            estatura: 75,
            unidadEstatura: "cm",
            percentilCrecimiento: 99,
            resultadoRango: "FueraRango",
          },
        }),
      ],
    ].entries() as IterableIterator<
      [number, readonly [string, ReturnType<typeof titular>]]
    >) {
      test(
        `REG-BMI-${String(indice + 5).padStart(3, "0")} | Indicador de ${nombre} fuera de rango → UW y Nuevas`,
        { tag: "@uw" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              asegurados:
                asegurado.tipo === "Titular"
                  ? [asegurado]
                  : [titular(), asegurado],
            }),
          );
          expect(resultado.requiereRevisionUW).toBe(true);
          expect(resultado.bandejaClaims).toBe("Nuevas");
          expect(resultado.motivosRevisionUW).toEqual([
            expect.stringContaining("fuera de rango"),
          ]);
        },
      );
    }
  });
});
