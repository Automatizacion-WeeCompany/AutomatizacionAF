import { expect, test } from "@playwright/test";
import { PreguntaMedica } from "../../types/ReglasSuscripcion";
import {
  DIAGNOSTICOS_CRITICOS_POR_PREGUNTA,
  evaluarSolicitud,
} from "../../utilidades/ReglasSuscripcion";
import {
  dependiente,
  solicitud,
  titular,
} from "./soporte/solicitudDecision";

test.describe("01. Reglas de decisión", { tag: "@regla" }, () => {
  test.describe("Diagnósticos críticos", { tag: "@diagnostico" }, () => {
    let indiceCaso = 0;

    for (const [pregunta, diagnosticos] of Object.entries(
      DIAGNOSTICOS_CRITICOS_POR_PREGUNTA,
    )) {
      for (const diagnostico of diagnosticos) {
        const idTitular = `REG-DX-CRIT-${String(++indiceCaso).padStart(3, "0")}`;
        test(
          `${idTitular} | Titular declara ${diagnostico} en ${pregunta} → rechazo total`,
          { tag: ["@rechazo", "@titular"] },
          () => {
            const resultado = evaluarSolicitud(
              solicitud({
                idioma: "Eng",
                respuestasMedicas: [
                  {
                    aseguradoId: "titular-1",
                    pregunta: pregunta as PreguntaMedica,
                    afirmativa: true,
                    diagnosticos: [diagnostico],
                  },
                ],
              }),
            );

            expect(resultado.rechazadaCompleta).toBe(true);
            expect(resultado.permiteCybersource).toBe(false);
            expect(resultado.bandejaClaims).toBe("Rechazadas");
            expect(resultado.estadoWeeBroker).toBe("Rejected Declaration");
            expect(resultado.motivosRechazoClaims.join(" ")).toContain(
              diagnostico,
            );
            expect(resultado.eventosCorreo).toContainEqual(
              expect.objectContaining({
                tipo: "DenegacionTitular",
                momento: "DespuesFirmasSolicitanteYConsultor",
              }),
            );
          },
        );

        const idDependiente = `REG-DX-CRIT-${String(++indiceCaso).padStart(3, "0")}`;
        test(
          `${idDependiente} | Dependiente declara ${diagnostico} en ${pregunta} → exclusión y recálculo`,
          { tag: ["@exclusion", "@dependiente"] },
          () => {
            const resultado = evaluarSolicitud(
              solicitud({
                asegurados: [titular(), dependiente()],
                respuestasMedicas: [
                  {
                    aseguradoId: "dependiente-1",
                    pregunta: pregunta as PreguntaMedica,
                    afirmativa: true,
                    diagnosticos: [diagnostico],
                  },
                ],
              }),
            );

            expect(resultado.rechazadaCompleta).toBe(false);
            expect(resultado.dependientesRechazados).toEqual([
              expect.objectContaining({
                aseguradoId: "dependiente-1",
                diagnosticos: [diagnostico],
              }),
            ]);
            expect(resultado.requiereRecalculoPrima).toBe(true);
            expect(resultado.permiteCybersource).toBe(true);
            expect(
              resultado.conservarDependientesRechazadosEnDeclaracionYPOA,
            ).toBe(true);
            expect(resultado.bandejaClaims).toBe("Nuevas");
            expect(resultado.eventosCorreo).toContainEqual(
              expect.objectContaining({ tipo: "DenegacionDependientes" }),
            );
          },
        );
      }
    }
  });
});
