import { EscenarioExcel } from '../types/EscenarioExcel';
import { VarianteValidacionTarifa } from '../types/ValidacionTarifas';

function composicionFamiliar(escenario: EscenarioExcel) {
  if (escenario.TipoPoliza === 'Individual') {
    return 'Titular';
  }

  return `Cónyuge=${escenario.ConyugePareja ?? 'No'}; Dependientes=${escenario.HijosMenoresDe24 ?? '0'}`;
}

export function obtenerVarianteValidacionTarifa(
  escenario: EscenarioExcel,
): VarianteValidacionTarifa {
  return {
    escenario: escenario.EscenarioPrueba,
    perfilCotizacion: escenario.PerfilCotizacion,
    configuracionPlan: escenario.ConfiguracionPlan,
    tipoPoliza: escenario.TipoPoliza,
    composicionFamiliar: composicionFamiliar(escenario),
    idioma: escenario.IdiomaCotizacion,
    plan: escenario.CotizarPlan,
    red: escenario.RedProveedores,
    deducible: escenario.Deducible,
    frecuenciaPago: escenario.FrecuenciaPago,
  };
}

export function generarEscenariosValidacionTarifas(
  escenarios: EscenarioExcel[],
) {
  const escenariosEmision = escenarios.filter(
    (escenario) =>
      escenario.ResultadoEsperado === 'Emision' &&
      escenario.ObjetivoBMI === 'Ninguno',
  );
  const tiposPoliza = new Set(
    escenariosEmision.map((escenario) => escenario.TipoPoliza),
  );
  const ids = escenariosEmision.map(
    (escenario) =>
      `${escenario.PerfilCotizacion}::${escenario.ConfiguracionPlan}::${escenario.IdiomaCotizacion}`,
  );

  if (
    escenariosEmision.length === 0 ||
    !tiposPoliza.has('Familiar') ||
    !tiposPoliza.has('Individual') ||
    new Set(ids).size !== ids.length
  ) {
    throw new Error(
      'La matriz de validación de tarifas requiere escenarios de emisión únicos para pólizas familiares e individuales',
    );
  }

  return escenariosEmision;
}
