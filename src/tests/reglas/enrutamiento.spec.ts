import { expect, test } from "@playwright/test";
import { evaluarSolicitud } from "../../utilidades/ReglasSuscripcion";
import {
  dependiente,
  solicitud,
  titular,
} from "./soporte/solicitudDecision";

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe(
    "Información general y enrutamiento",
    { tag: "@enrutamiento" },
    () => {
      test(
        "REG-RUTA-001 | Respuesta general afirmativa distinta de PEP → Nuevas",
        { tag: "@informacion-general" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasInformacionGeneral: [
                { codigo: "SEGURO_RECHAZADO_PREVIAMENTE", afirmativa: true },
              ],
            }),
          );
          expect(resultado.bandejaClaims).toBe("Nuevas");
        },
      );

      test(
        "REG-RUTA-002 | Únicamente archivo de cobertura previa → Nuevas",
        { tag: "@cobertura-previa" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({ archivosCoberturaPrevia: ["certificado-prueba.pdf"] }),
          );
          expect(resultado.bandejaClaims).toBe("Nuevas");
        },
      );

      test(
        "REG-RUTA-003 | Única respuesta afirmativa PEP → Pendientes sin UW",
        { tag: "@pep" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasInformacionGeneral: [
                {
                  codigo: "PERSONA_POLITICAMENTE_EXPUESTA",
                  afirmativa: true,
                  esPersonaPoliticamenteExpuesta: true,
                },
              ],
            }),
          );
          expect(resultado.requiereRevisionUW).toBe(false);
          expect(resultado.bandejaClaims).toBe("Pendientes");
        },
      );

      test(
        "REG-RUTA-004 | Código PEP sin indicador opcional → Pendientes",
        { tag: "@pep" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasInformacionGeneral: [
                {
                  codigo: "PERSONA_POLITICAMENTE_EXPUESTA",
                  afirmativa: true,
                },
              ],
            }),
          );
          expect(resultado.bandejaClaims).toBe("Pendientes");
        },
      );

      test(
        "REG-RUTA-005 | Lista de archivos con nombres vacíos → Pendientes",
        { tag: "@cobertura-previa" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({ archivosCoberturaPrevia: ["", "   "] }),
          );
          expect(resultado.bandejaClaims).toBe("Pendientes");
        },
      );

      test("REG-RUTA-006 | Solicitud limpia → Pendientes", () => {
        const resultado = evaluarSolicitud(solicitud());
        expect(resultado.requiereRevisionUW).toBe(false);
        expect(resultado.rechazadaCompleta).toBe(false);
        expect(resultado.bandejaClaims).toBe("Pendientes");
      });

      test("REG-RUTA-007 | Enrutamiento → conserva trazabilidad", () => {
        const entrada = solicitud();
        const resultado = evaluarSolicitud(entrada);
        expect(resultado.trazabilidad).toEqual(entrada.trazabilidad);
      });

      test(
        "REG-RUTA-008 | Rechazo del titular y criterios UW → prevalece Rechazadas",
        { tag: ["@rechazo", "@precedencia", "@titular"] },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              respuestasMedicas: [
                {
                  aseguradoId: "titular-1",
                  pregunta: "F",
                  afirmativa: true,
                  diagnosticos: ["Diabetes Tipo 1"],
                },
              ],
              respuestasInformacionGeneral: [
                { codigo: "OTRA_RESPUESTA", afirmativa: true },
              ],
              archivosCoberturaPrevia: ["documento.pdf"],
            }),
          );
          expect(resultado.bandejaClaims).toBe("Rechazadas");
          expect(resultado.requiereRevisionUW).toBe(false);
        },
      );

      test(
        "REG-RUTA-009 | Rechazo del titular y dependiente crítico → cancela exclusión y recálculo",
        { tag: ["@rechazo", "@precedencia", "@titular", "@dependiente"] },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              asegurados: [titular(), dependiente()],
              respuestasMedicas: [
                {
                  aseguradoId: "titular-1",
                  pregunta: "F",
                  afirmativa: true,
                  diagnosticos: ["Diabetes Tipo 1"],
                },
                {
                  aseguradoId: "dependiente-1",
                  pregunta: "D",
                  afirmativa: true,
                  diagnosticos: ["Psicosis"],
                },
              ],
            }),
          );
          expect(resultado.bandejaClaims).toBe("Rechazadas");
          expect(resultado.dependientesRechazados).toEqual([]);
          expect(resultado.requiereRecalculoPrima).toBe(false);
        },
      );
    },
  );
});
