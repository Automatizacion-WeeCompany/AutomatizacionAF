const logsInformativosHabilitados =
  !process.env.CI || process.env.CI_VERBOSE === "1";

/**
 * Conserva el detalle durante ejecuciones locales y evita saturar la salida de
 * CI/CD. Para un diagnóstico remoto puntual se puede usar CI_VERBOSE=1.
 */
export function registrarInfo(...datos: unknown[]) {
  if (logsInformativosHabilitados) {
    console.log(...datos);
  }
}
