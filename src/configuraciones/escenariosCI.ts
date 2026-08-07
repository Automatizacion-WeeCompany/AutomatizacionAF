const ESCENARIOS_COTIZADOR_CI = new Set([
  "Familiar Conyuge 1 Dependiente Titular Rechazo BMI | Superior Ultra Anual",
  "Individual Rechazo BMI | Superior Ultra Anual",
]);

const ESCENARIOS_EMISION_CI = new Set([
  "Emision 1 | Familiar Conyuge 1 Dependiente Normal | Superior Ultra Anual",
  "Emision 1 | Individual Normal | Superior Ultra Anual",
]);

/**
 * Identifica los recorridos representativos del smoke de CI/CD. La suite local
 * no usa este filtro y continúa descubriendo la matriz completa.
 */
export function esEscenarioCotizadorCI(escenario: string) {
  return ESCENARIOS_COTIZADOR_CI.has(escenario);
}

export function esEscenarioEmisionCI(
  escenarioClaims: string,
  escenarioCotizador: string,
) {
  return ESCENARIOS_EMISION_CI.has(
    `${escenarioClaims} | ${escenarioCotizador}`,
  );
}
