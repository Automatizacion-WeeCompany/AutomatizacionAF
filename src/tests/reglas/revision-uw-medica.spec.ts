import { expect, test } from "@playwright/test";
import { PreguntaMedica } from "../../types/ReglasSuscripcion";
import {
  evaluarSolicitud,
  PREGUNTAS_UW_SIN_EXCEPCION,
} from "../../utilidades/ReglasSuscripcion";
import { solicitud } from "./soporte/solicitudDecision";

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe(
    "Diagnósticos y respuestas que requieren UW",
    { tag: ["@diagnostico", "@uw"] },
    () => {
      const diagnosticosNoCriticos: Array<[PreguntaMedica, string]> = [
        ["C", "Epilepsia"],
        ["D", "Ansiedad"],
        ["F", "Diabetes Tipo 2"],
        ["G", "Hipertensión Arterial"],
        ["I", "Anemia"],
        ["K", "Úlcera"],
        ["L", "Cálculos renales"],
        ["N", "Otra malformación"],
      ];

      for (const [indice, [pregunta, diagnostico]] of diagnosticosNoCriticos.entries()) {
        test(`REG-UW-DX-${String(indice + 1).padStart(3, "0")} | ${pregunta} con diagnóstico no crítico ${diagnostico} → UW y Nuevas`, () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasMedicas: [
                {
                  aseguradoId: "titular-1",
                  pregunta,
                  afirmativa: true,
                  diagnosticos: [diagnostico],
                },
              ],
            }),
          );
          expect(resultado.rechazadaCompleta).toBe(false);
          expect(resultado.requiereRevisionUW).toBe(true);
          expect(resultado.bandejaClaims).toBe("Nuevas");
        });
      }

      for (const [indice, pregunta] of PREGUNTAS_UW_SIN_EXCEPCION.entries()) {
        test(`REG-UW-PREG-${String(indice + 1).padStart(3, "0")} | Respuesta afirmativa en ${pregunta} → UW y Nuevas`, () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasMedicas: [
                {
                  aseguradoId: "titular-1",
                  pregunta,
                  afirmativa: true,
                },
              ],
            }),
          );
          expect(resultado.requiereRevisionUW).toBe(true);
          expect(resultado.bandejaClaims).toBe("Nuevas");
        });
      }

      for (const [indice, [pregunta, diagnostico, formulario]] of [
        ["A", "Cualquier tumor", "Cancer"],
        ["F", "Diabetes Tipo 2", "Diabetes"],
        ["G", "Hipertensión Arterial", "HipertensionArterial"],
        ["G", "Valvulopatía cardíaca", "EnfermedadesCardiacas"],
        [
          "G",
          "Obstrucción arterial o infarto de miocardio",
          "EnfermedadesCardiacas",
        ],
        ["G", "Embolia", "EnfermedadesCardiacas"],
        ["G", "Arritmias", "EnfermedadesCardiacas"],
        [
          "G",
          "Cualquier otro trastorno cardiovascular",
          "EnfermedadesCardiacas",
        ],
      ].entries() as IterableIterator<
        [number, readonly [PreguntaMedica, string, "Cancer" | "Diabetes" | "HipertensionArterial" | "EnfermedadesCardiacas"]]
      >) {
        test(`REG-UW-FORM-${String(indice + 1).padStart(3, "0")} | ${diagnostico} → adjunta formulario ${formulario}`, () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasMedicas: [
                {
                  aseguradoId: "titular-1",
                  pregunta,
                  afirmativa: true,
                  diagnosticos: [diagnostico],
                },
              ],
            }),
          );
          expect(resultado.formulariosMedicos).toContain(formulario);
        });
      }
    },
  );
});
