export interface DatosAntropometricosPrueba {
  estaturaCm: number;
  pesoKg: number;
}

const DATOS_SEGUROS_POR_EDAD = Object.freeze({
  infante: { estaturaCm: 75, pesoKg: 9 },
  primeraInfancia: { estaturaCm: 105, pesoKg: 17 },
  infancia: { estaturaCm: 135, pesoKg: 32 },
  adolescencia: { estaturaCm: 160, pesoKg: 50 },
  adulto: { estaturaCm: 170, pesoKg: 65 },
});

export const DATOS_ANTROPOMETRICOS_RECHAZO_BMI = Object.freeze({
  estaturaCm: 180,
  pesoKg: 180,
});

/**
 * Datos sintéticos estables para que una prueba que no busca una salida BMI
 * no dependa de combinaciones aleatorias de edad, peso y estatura.
 */
export function obtenerDatosAntropometricosSeguros(
  edadAnios: number,
): DatosAntropometricosPrueba {
  if (!Number.isInteger(edadAnios) || edadAnios < 0 || edadAnios > 76) {
    throw new Error(`Edad no asegurable para datos de prueba: ${edadAnios}`);
  }
  if (edadAnios < 2) {
    return DATOS_SEGUROS_POR_EDAD.infante;
  }
  if (edadAnios <= 5) {
    return DATOS_SEGUROS_POR_EDAD.primeraInfancia;
  }
  if (edadAnios <= 11) {
    return DATOS_SEGUROS_POR_EDAD.infancia;
  }
  if (edadAnios <= 17) {
    return DATOS_SEGUROS_POR_EDAD.adolescencia;
  }
  return DATOS_SEGUROS_POR_EDAD.adulto;
}
