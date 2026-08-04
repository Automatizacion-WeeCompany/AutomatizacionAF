import {
  ConfiguracionPlanExcel,
  EscenarioExcel,
  PerfilCotizacionExcel,
} from "../types/EscenarioExcel";
import { validarEscenariosExcel } from "./ValidarEscenariosExcel";

const PLANES_Y_REDES_ESPERADOS = new Set([
  "Superior|Ultra",
  "Superior|Open",
  "Optima|Ultra",
  "Optima|Plus",
  "Vital|Plus",
  "Vital|Core",
]);

const DEDUCIBLES_ESPERADOS = new Set([
  "$1,000.00 / $3,000.00 USD",
  "$2,000.00 / $4,000.00 USD",
  "$5,000.00 / $5,000.00 USD",
  "$5,000.00 / $7,500.00 USD",
]);

const PERFILES_ESPERADOS = new Set([
  "Familiar|1|Emision|Ninguno",
  "Familiar|2|Emision|Ninguno",
  "Familiar|3+|Emision|Ninguno",
  "Familiar|1|EvaluacionBMI|Titular",
  "Familiar|2|EvaluacionBMI|Titular",
  "Familiar|3+|EvaluacionBMI|Titular",
  "Individual||Emision|Ninguno",
  "Individual||EvaluacionBMI|Titular",
]);

function validarCoberturaConfiguraciones(
  configuraciones: ConfiguracionPlanExcel[],
) {
  const errores: string[] = [];

  for (const planRed of PLANES_Y_REDES_ESPERADOS) {
    const [plan, red] = planRed.split("|");
    const deducibles = configuraciones
      .filter(
        (configuracion) =>
          configuracion.CotizarPlan === plan &&
          configuracion.RedProveedores === red,
      )
      .map((configuracion) => configuracion.Deducible);

    for (const deducible of DEDUCIBLES_ESPERADOS) {
      const repeticiones = deducibles.filter(
        (valor) => valor === deducible,
      ).length;
      if (repeticiones !== 1) {
        errores.push(
          `${plan}/${red} debe incluir una vez el deducible "${deducible}"; encontrados: ${repeticiones}`,
        );
      }
    }
  }

  const planRedAdicionales = new Set(
    configuraciones
      .map(
        (configuracion) =>
          `${configuracion.CotizarPlan}|${configuracion.RedProveedores}`,
      )
      .filter((planRed) => !PLANES_Y_REDES_ESPERADOS.has(planRed)),
  );
  if (planRedAdicionales.size > 0) {
    errores.push(
      `combinaciones plan/red no soportadas: ${[...planRedAdicionales].join(", ")}`,
    );
  }

  if (errores.length > 0) {
    throw new Error(
      `Cobertura incompleta en ConfiguracionesPlan:\n- ${errores.join("\n- ")}`,
    );
  }
}

function validarCoberturaPerfiles(perfiles: PerfilCotizacionExcel[]) {
  const firmas = perfiles.map(
    (perfil) =>
      `${perfil.TipoPoliza}|${perfil.HijosMenoresDe24 ?? ""}|${perfil.ResultadoEsperado}|${perfil.ObjetivoBMI}`,
  );
  const errores: string[] = [];

  for (const firma of PERFILES_ESPERADOS) {
    const repeticiones = firmas.filter((valor) => valor === firma).length;
    if (repeticiones !== 1) {
      errores.push(
        `el perfil "${firma}" debe existir una vez; encontrados: ${repeticiones}`,
      );
    }
  }

  const perfilesAdicionales = new Set(
    firmas.filter((firma) => !PERFILES_ESPERADOS.has(firma)),
  );
  if (perfilesAdicionales.size > 0) {
    errores.push(
      `perfiles no contemplados en la matriz acordada: ${[...perfilesAdicionales].join(", ")}`,
    );
  }

  if (errores.length > 0) {
    throw new Error(
      `Cobertura incompleta en PerfilesCotizacion:\n- ${errores.join("\n- ")}`,
    );
  }
}

export function generarEscenariosCotizador(
  configuraciones: ConfiguracionPlanExcel[],
  perfiles: PerfilCotizacionExcel[],
) {
  const configuracionesValidas = validarEscenariosExcel(
    "ConfiguracionesPlan",
    configuraciones,
  );
  const perfilesValidos = validarEscenariosExcel(
    "PerfilesCotizacion",
    perfiles,
  );

  validarCoberturaConfiguraciones(configuracionesValidas);
  validarCoberturaPerfiles(perfilesValidos);

  const escenarios = perfilesValidos.flatMap((perfil) =>
    configuracionesValidas.map((configuracion): EscenarioExcel => ({
      ...perfil,
      ...configuracion,
      EscenarioPrueba: `${perfil.PerfilCotizacion} | ${configuracion.ConfiguracionPlan}`,
    })),
  );

  return validarEscenariosExcel("CotizadorAF", escenarios);
}
