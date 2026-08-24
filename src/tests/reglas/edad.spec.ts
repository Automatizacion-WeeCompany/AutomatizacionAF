import { expect, test } from "@playwright/test";
import {
  calcularEdadExacta,
  evaluarSolicitud,
} from "../../utilidades/ReglasSuscripcion";
import {
  FECHA_EVALUACION,
  fechaNacimiento,
  solicitud,
  titular,
} from "./soporte/solicitudDecision";

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe("Edad", { tag: "@edad" }, () => {
    test("REG-EDAD-001 | Fecha previa al cumpleaños → edad exacta sin anticipación", () => {
      const nacimiento = new Date(1949, 7, 21);
      expect(calcularEdadExacta(nacimiento, FECHA_EVALUACION)).toEqual({
        anios: 76,
        mesesTotales: 923,
      });
    });

    test(
      "REG-EDAD-002 | Asegurado de 77 años → bloquea guardar, avanzar y pagar",
      { tag: "@bloqueo" },
      () => {
        const resultado = evaluarSolicitud(
          solicitud({
            asegurados: [titular({ fechaNacimiento: fechaNacimiento(77) })],
          }),
        );

        expect(resultado.bloqueada).toBe(true);
        expect(resultado.motivoBloqueo).toBe("EdadNoAsegurable");
        expect(resultado.permiteGuardarYAvanzar).toBe(false);
        expect(resultado.permiteCybersource).toBe(false);
        expect(resultado.bandejaClaims).toBeUndefined();
      },
    );

    for (const [indice, edad] of [64, 76].entries()) {
      test(
        `REG-EDAD-${String(indice + 3).padStart(3, "0")} | Asegurado de ${edad} años → UW, Nuevas y correo de edad avanzada`,
        { tag: "@uw" },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              asegurados: [titular({ fechaNacimiento: fechaNacimiento(edad) })],
            }),
          );

          expect(resultado.requiereRevisionUW).toBe(true);
          expect(resultado.bandejaClaims).toBe("Nuevas");
          expect(resultado.estadoWeeBroker).toBe("En Suscripción");
          expect(resultado.eventosCorreo).toContainEqual(
            expect.objectContaining({
              tipo: "RequerimientosEdadAvanzada",
              momento: "DespuesInformacionGeneral",
              registrarEnLog: true,
            }),
          );
        },
      );
    }

    for (const [indice, [idioma, estado]] of [
      ["Esp", "En Suscripción"],
      ["Eng", "In Underwriting"],
      ["Port", "Em Subscrição"],
    ].entries() as IterableIterator<
      [number, readonly ["Esp" | "Eng" | "Port", string]]
    >) {
      test(
        `REG-EDAD-${String(indice + 5).padStart(3, "0")} | Edad avanzada en ${idioma} → estado UW localizado`,
        { tag: ["@uw", "@contrato"] },
        () => {
          const resultado = evaluarSolicitud(
            solicitud({
              idioma,
              asegurados: [titular({ fechaNacimiento: fechaNacimiento(64) })],
            }),
          );
          expect(resultado.estadoWeeBroker).toBe(estado);
        },
      );
    }
  });
});
