type RegistroExcel = Record<string, unknown> & { __rowNum__?: number };

const IDIOMAS = new Set(['Esp', 'Eng', 'Port']);
const TIPOS_POLIZA = new Set(['Familiar', 'Individual']);
const RESULTADOS_ESPERADOS = new Set(['Emision', 'EvaluacionBMI']);
const OBJETIVOS_BMI = new Set([
  'Ninguno',
  'Titular',
  'Dependiente1',
  'Dependiente2',
  'Dependiente3',
  'Dependiente4',
  'Dependiente5',
]);
const FRECUENCIAS_PAGO = new Set([
  'Mensual',
  'Trimestral',
  'Semestral',
  'Anual',
]);
const DEDUCIBLES = new Set([
  '$1,000.00 / $3,000.00 USD',
  '$2,000.00 / $4,000.00 USD',
  '$5,000.00 / $5,000.00 USD',
  '$5,000.00 / $7,500.00 USD',
]);
const REDES_POR_PLAN: Record<string, Set<string>> = {
  Superior: new Set(['Ultra', 'Open']),
  Optima: new Set(['Ultra', 'Plus']),
  Vital: new Set(['Plus', 'Core']),
};
const SEXOS = new Set(['Masculino', 'Femenino']);
const ESTADOS_CIVILES = new Set(['Casado(a)', 'Soltero(a)']);
const TIPOS_DEPENDIENTE = new Set([
  'Hijo Biológico',
  'Hijastro',
  'Hijo Adoptado Legalmente',
  'Menor Bajo Custodia Legal',
]);
const CAMPOS_BINARIOS_ESTRICTOS = [
  'TelefonoSecundario',
  'EliminarTelSec',
  'DireccionCorrespondencia',
  'EliminarDirCorr',
];
const CAMPOS_DEPENDIENTES = [
  ['Hijo1', 'SexoDependiente1'],
  ['Hijo2', 'SexoDependiente2'],
  ['Hijo3', 'SexoDependiente3'],
  ['Hijo4', 'SexoDependiente4'],
  ['Hijo5', 'SexoDependiente5'],
] as const;

function esVacio(valor: unknown) {
  return valor === undefined || valor === null || String(valor).trim() === '';
}

function filaExcel(registro: RegistroExcel, indice: number) {
  return typeof registro.__rowNum__ === 'number'
    ? registro.__rowNum__ + 1
    : indice + 2;
}

function esRespuestaBinaria(valor: unknown) {
  const normalizado = String(valor ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return normalizado === 'si' || normalizado === 'no';
}

function agregarError(
  errores: string[],
  fila: number,
  campo: string,
  detalle: string,
) {
  errores.push(`fila ${fila}, ${campo}: ${detalle}`);
}

function contarDependientesCompletos(registro: RegistroExcel) {
  return CAMPOS_DEPENDIENTES.filter(
    ([campoRelacion, campoSexo]) =>
      !esVacio(registro[campoRelacion]) && !esVacio(registro[campoSexo]),
  ).length;
}

function validarCantidadDependientes(
  registro: RegistroExcel,
  fila: number,
  dependientesCompletos: number,
  errores: string[],
) {
  const cantidad = String(registro.HijosMenoresDe24 ?? '').trim();
  const cantidadExacta = Number(cantidad);

  if (cantidad === '3+') {
    if (dependientesCompletos < 3) {
      agregarError(
        errores,
        fila,
        'HijosMenoresDe24',
        `3+ requiere al menos 3 dependientes completos; encontrados: ${dependientesCompletos}`,
      );
    }
    return;
  }

  if (!Number.isInteger(cantidadExacta) || cantidadExacta < 1) {
    agregarError(
      errores,
      fila,
      'HijosMenoresDe24',
      `cantidad no soportada "${cantidad}"; use 1, 2 o 3+`,
    );
    return;
  }

  if (dependientesCompletos !== cantidadExacta) {
    agregarError(
      errores,
      fila,
      'Hijo1...Hijo5',
      `se esperaban ${cantidadExacta} dependientes completos; encontrados: ${dependientesCompletos}`,
    );
  }
}

function validarResultadoBMI(
  registro: RegistroExcel,
  fila: number,
  tipoPoliza: string,
  dependientesCompletos: number,
  errores: string[],
) {
  if (esVacio(registro.ResultadoEsperado) && esVacio(registro.ObjetivoBMI)) {
    return;
  }

  const resultado = String(registro.ResultadoEsperado ?? '');
  const objetivo = String(registro.ObjetivoBMI ?? '');

  if (!RESULTADOS_ESPERADOS.has(resultado)) {
    agregarError(
      errores,
      fila,
      'ResultadoEsperado',
      `valor no soportado "${resultado}"`,
    );
  }
  if (!OBJETIVOS_BMI.has(objetivo)) {
    agregarError(
      errores,
      fila,
      'ObjetivoBMI',
      `valor no soportado "${objetivo}"`,
    );
    return;
  }

  if (resultado === 'Emision' && objetivo !== 'Ninguno') {
    agregarError(
      errores,
      fila,
      'ObjetivoBMI',
      'debe ser Ninguno cuando el resultado esperado es Emision',
    );
  }

  if (resultado !== 'EvaluacionBMI') {
    return;
  }

  if (tipoPoliza === 'Individual' && objetivo !== 'Titular') {
    agregarError(
      errores,
      fila,
      'ObjetivoBMI',
      'una evaluación BMI Individual debe aplicarse al Titular',
    );
  }

  if (tipoPoliza === 'Familiar') {
    if (objetivo === 'Titular') {
      return;
    }

    const coincidencia = /^Dependiente([1-5])$/.exec(objetivo);
    const indiceDependiente = coincidencia ? Number(coincidencia[1]) : 0;
    if (indiceDependiente < 1 || indiceDependiente > dependientesCompletos) {
      agregarError(
        errores,
        fila,
        'ObjetivoBMI',
        `debe apuntar a un dependiente existente; encontrados: ${dependientesCompletos}`,
      );
    }
  }
}

function validarCotizador(registros: RegistroExcel[]) {
  const errores: string[] = [];
  const nombres = new Map<string, number>();
  const obligatorios = [
    'Url',
    'IdiomaCotizacion',
    'CorreoInicio',
    'Contrasena',
    'TipoPoliza',
    'CotizarPlan',
    'RedProveedores',
    'Deducible',
    'FrecuenciaPago',
    'SexoAlNacer',
    'EstadoCivil',
    'TelefonoSecundario',
    'EliminarTelSec',
    'OcupacionTitular',
    'TipoIdentificacionTitular',
    'DireccionCorrespondencia',
    'EliminarDirCorr',
    'RelacionSolicitantePrimario',
    'CuestionarioMedicoCaptura',
    'CapturaPreguntasPt2',
  ];

  registros.forEach((registro, indice) => {
    if (esVacio(registro.EscenarioPrueba)) {
      return;
    }

    const fila = filaExcel(registro, indice);
    const nombre = String(registro.EscenarioPrueba).trim();
    const filaDuplicada = nombres.get(nombre);
    if (filaDuplicada) {
      agregarError(
        errores,
        fila,
        'EscenarioPrueba',
        `nombre duplicado; ya existe en la fila ${filaDuplicada}`,
      );
    } else {
      nombres.set(nombre, fila);
    }

    for (const campo of obligatorios) {
      if (esVacio(registro[campo])) {
        agregarError(errores, fila, campo, 'valor obligatorio vacío');
      }
    }

    const idioma = String(registro.IdiomaCotizacion ?? '');
    const tipoPoliza = String(registro.TipoPoliza ?? '');
    const plan = String(registro.CotizarPlan ?? '');
    const red = String(registro.RedProveedores ?? '');

    if (!IDIOMAS.has(idioma)) {
      agregarError(errores, fila, 'IdiomaCotizacion', `valor no soportado "${idioma}"`);
    }
    if (!TIPOS_POLIZA.has(tipoPoliza)) {
      agregarError(errores, fila, 'TipoPoliza', `valor no soportado "${tipoPoliza}"`);
    }
    if (!REDES_POR_PLAN[plan]) {
      agregarError(errores, fila, 'CotizarPlan', `valor no soportado "${plan}"`);
    } else if (!REDES_POR_PLAN[plan].has(red)) {
      agregarError(
        errores,
        fila,
        'RedProveedores',
        `"${red}" no corresponde al plan "${plan}"`,
      );
    }
    if (!DEDUCIBLES.has(String(registro.Deducible ?? ''))) {
      agregarError(
        errores,
        fila,
        'Deducible',
        `valor no reconocido "${registro.Deducible ?? ''}"`,
      );
    }
    if (!FRECUENCIAS_PAGO.has(String(registro.FrecuenciaPago ?? ''))) {
      agregarError(
        errores,
        fila,
        'FrecuenciaPago',
        `valor no soportado "${registro.FrecuenciaPago ?? ''}"`,
      );
    }
    if (!SEXOS.has(String(registro.SexoAlNacer ?? ''))) {
      agregarError(
        errores,
        fila,
        'SexoAlNacer',
        `valor no soportado "${registro.SexoAlNacer ?? ''}"`,
      );
    }
    if (!ESTADOS_CIVILES.has(String(registro.EstadoCivil ?? ''))) {
      agregarError(
        errores,
        fila,
        'EstadoCivil',
        `valor no soportado "${registro.EstadoCivil ?? ''}"`,
      );
    }

    for (const campo of CAMPOS_BINARIOS_ESTRICTOS) {
      if (registro[campo] !== 'Si' && registro[campo] !== 'No') {
        agregarError(errores, fila, campo, 'debe contener exactamente Si o No');
      }
    }
    for (const campo of [
      'CuestionarioMedicoCaptura',
      'SigueIngiriendo',
      'CapturaPreguntasPt2',
    ]) {
      if (!esRespuestaBinaria(registro[campo])) {
        agregarError(errores, fila, campo, 'debe contener Si o No');
      }
    }

    if (
      registro.TelefonoSecundario !== 'Si' &&
      registro.EliminarTelSec === 'Si'
    ) {
      agregarError(
        errores,
        fila,
        'EliminarTelSec',
        'no se puede eliminar un teléfono que no se agregó',
      );
    }
    if (
      registro.DireccionCorrespondencia !== 'Si' &&
      registro.EliminarDirCorr === 'Si'
    ) {
      agregarError(
        errores,
        fila,
        'EliminarDirCorr',
        'no se puede eliminar una dirección que no se agregó',
      );
    }

    let dependientesCompletos = 0;
    for (const [campoRelacion, campoSexo] of CAMPOS_DEPENDIENTES) {
      const relacion = registro[campoRelacion];
      const sexo = registro[campoSexo];
      if (esVacio(relacion) && esVacio(sexo)) {
        continue;
      }
      if (!TIPOS_DEPENDIENTE.has(String(relacion ?? ''))) {
        agregarError(
          errores,
          fila,
          campoRelacion,
          `valor no soportado "${relacion ?? ''}"`,
        );
      }
      if (!SEXOS.has(String(sexo ?? ''))) {
        agregarError(
          errores,
          fila,
          campoSexo,
          `valor no soportado o faltante "${sexo ?? ''}"`,
        );
      }
      if (
        TIPOS_DEPENDIENTE.has(String(relacion ?? '')) &&
        SEXOS.has(String(sexo ?? ''))
      ) {
        dependientesCompletos++;
      }
    }

    if (tipoPoliza === 'Familiar') {
      if (registro.ConyugePareja !== 'Si' && registro.ConyugePareja !== 'No') {
        agregarError(
          errores,
          fila,
          'ConyugePareja',
          'debe contener exactamente Si o No',
        );
      }
      if (esVacio(registro.HijosMenoresDe24)) {
        agregarError(
          errores,
          fila,
          'HijosMenoresDe24',
          'valor obligatorio para una póliza Familiar',
        );
      }
      if (dependientesCompletos === 0) {
        agregarError(
          errores,
          fila,
          'Hijo1...Hijo5',
          'la póliza Familiar debe incluir al menos un dependiente completo',
        );
      } else {
        validarCantidadDependientes(
          registro,
          fila,
          dependientesCompletos,
          errores,
        );
      }
    }

    if (tipoPoliza === 'Individual') {
      for (const campo of [
        'ConyugePareja',
        'HijosMenoresDe24',
        ...CAMPOS_DEPENDIENTES.flat(),
      ]) {
        if (!esVacio(registro[campo])) {
          agregarError(
            errores,
            fila,
            campo,
            'debe permanecer vacío para una póliza Individual',
          );
        }
      }
    }

    validarResultadoBMI(
      registro,
      fila,
      tipoPoliza,
      dependientesCompletos,
      errores,
    );

    if (
      esRespuestaBinaria(registro.CuestionarioMedicoCaptura) &&
      String(registro.CuestionarioMedicoCaptura)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() === 'si'
    ) {
      if (registro.P5Sustancia !== 'Productos de Nicotina') {
        agregarError(
          errores,
          fila,
          'P5Sustancia',
          `valor no traducible "${registro.P5Sustancia ?? ''}"`,
        );
      }
    }

    if (registro.OcupacionTitular !== 'Arte/Entretenimiento/Medios') {
      agregarError(
        errores,
        fila,
        'OcupacionTitular',
        `valor no traducible "${registro.OcupacionTitular ?? ''}"`,
      );
    }
    if (registro.TipoIdentificacionTitular !== 'ID del país') {
      agregarError(
        errores,
        fila,
        'TipoIdentificacionTitular',
        `valor no traducible "${registro.TipoIdentificacionTitular ?? ''}"`,
      );
    }
    if (registro.RelacionSolicitantePrimario !== 'Cónyuge/Pareja Doméstica') {
      agregarError(
        errores,
        fila,
        'RelacionSolicitantePrimario',
        `valor no traducible "${registro.RelacionSolicitantePrimario ?? ''}"`,
      );
    }

    if (/\bESP\b/i.test(nombre) && idioma !== 'Esp') {
      agregarError(
        errores,
        fila,
        'IdiomaCotizacion',
        'el nombre del escenario indica ESP',
      );
    }
    if (/\bENG\b/i.test(nombre) && idioma !== 'Eng') {
      agregarError(
        errores,
        fila,
        'IdiomaCotizacion',
        'el nombre del escenario indica ENG',
      );
    }
  });

  return errores;
}

function validarConfiguracionesPlan(registros: RegistroExcel[]) {
  const errores: string[] = [];
  const nombres = new Map<string, number>();
  const firmas = new Map<string, number>();
  const obligatorios = [
    'ConfiguracionPlan',
    'CotizarPlan',
    'RedProveedores',
    'Deducible',
    'FrecuenciaPago',
  ];

  registros.forEach((registro, indice) => {
    if (esVacio(registro.ConfiguracionPlan)) {
      return;
    }

    const fila = filaExcel(registro, indice);
    const nombre = String(registro.ConfiguracionPlan).trim();
    const plan = String(registro.CotizarPlan ?? '');
    const red = String(registro.RedProveedores ?? '');
    const deducible = String(registro.Deducible ?? '');
    const frecuencia = String(registro.FrecuenciaPago ?? '');

    for (const campo of obligatorios) {
      if (esVacio(registro[campo])) {
        agregarError(errores, fila, campo, 'valor obligatorio vacío');
      }
    }

    const filaNombre = nombres.get(nombre);
    if (filaNombre) {
      agregarError(
        errores,
        fila,
        'ConfiguracionPlan',
        `nombre duplicado; ya existe en la fila ${filaNombre}`,
      );
    } else {
      nombres.set(nombre, fila);
    }

    const firma = `${plan}|${red}|${deducible}`;
    const filaFirma = firmas.get(firma);
    if (filaFirma) {
      agregarError(
        errores,
        fila,
        'ConfiguracionPlan',
        `combinación plan/red/deducible duplicada; ya existe en la fila ${filaFirma}`,
      );
    } else {
      firmas.set(firma, fila);
    }

    if (!REDES_POR_PLAN[plan]) {
      agregarError(errores, fila, 'CotizarPlan', `valor no soportado "${plan}"`);
    } else if (!REDES_POR_PLAN[plan].has(red)) {
      agregarError(
        errores,
        fila,
        'RedProveedores',
        `"${red}" no corresponde al plan "${plan}"`,
      );
    }
    if (!DEDUCIBLES.has(deducible)) {
      agregarError(
        errores,
        fila,
        'Deducible',
        `valor no reconocido "${deducible}"`,
      );
    }
    if (!FRECUENCIAS_PAGO.has(frecuencia)) {
      agregarError(
        errores,
        fila,
        'FrecuenciaPago',
        `valor no soportado "${frecuencia}"`,
      );
    }
  });

  return errores;
}

function validarPerfilesCotizacion(registros: RegistroExcel[]) {
  const errores: string[] = [];
  const nombres = new Map<string, number>();
  const obligatorios = [
    'PerfilCotizacion',
    'Url',
    'IdiomaCotizacion',
    'CorreoInicio',
    'Contrasena',
    'TipoPoliza',
    'ResultadoEsperado',
    'ObjetivoBMI',
    'SexoAlNacer',
    'EstadoCivil',
    'TelefonoSecundario',
    'EliminarTelSec',
    'OcupacionTitular',
    'TipoIdentificacionTitular',
    'DireccionCorrespondencia',
    'EliminarDirCorr',
    'RelacionSolicitantePrimario',
    'CuestionarioMedicoCaptura',
    'SigueIngiriendo',
    'CapturaPreguntasPt2',
  ];

  registros.forEach((registro, indice) => {
    if (esVacio(registro.PerfilCotizacion)) {
      return;
    }

    const fila = filaExcel(registro, indice);
    const nombre = String(registro.PerfilCotizacion).trim();
    const tipoPoliza = String(registro.TipoPoliza ?? '');
    const idioma = String(registro.IdiomaCotizacion ?? '');

    for (const campo of obligatorios) {
      if (esVacio(registro[campo])) {
        agregarError(errores, fila, campo, 'valor obligatorio vacío');
      }
    }

    const filaDuplicada = nombres.get(nombre);
    if (filaDuplicada) {
      agregarError(
        errores,
        fila,
        'PerfilCotizacion',
        `nombre duplicado; ya existe en la fila ${filaDuplicada}`,
      );
    } else {
      nombres.set(nombre, fila);
    }

    if (!IDIOMAS.has(idioma)) {
      agregarError(errores, fila, 'IdiomaCotizacion', `valor no soportado "${idioma}"`);
    }
    if (!TIPOS_POLIZA.has(tipoPoliza)) {
      agregarError(errores, fila, 'TipoPoliza', `valor no soportado "${tipoPoliza}"`);
    }

    const dependientesCompletos = contarDependientesCompletos(registro);
    if (tipoPoliza === 'Familiar') {
      if (registro.ConyugePareja !== 'Si') {
        agregarError(
          errores,
          fila,
          'ConyugePareja',
          'los perfiles familiares de esta matriz deben incluir cónyuge con Si',
        );
      }
      if (esVacio(registro.HijosMenoresDe24)) {
        agregarError(
          errores,
          fila,
          'HijosMenoresDe24',
          'valor obligatorio para una póliza Familiar',
        );
      } else {
        validarCantidadDependientes(
          registro,
          fila,
          dependientesCompletos,
          errores,
        );
      }
    }

    if (tipoPoliza === 'Individual') {
      for (const campo of [
        'ConyugePareja',
        'HijosMenoresDe24',
        ...CAMPOS_DEPENDIENTES.flat(),
      ]) {
        if (!esVacio(registro[campo])) {
          agregarError(
            errores,
            fila,
            campo,
            'debe permanecer vacío para una póliza Individual',
          );
        }
      }
    }

    validarResultadoBMI(
      registro,
      fila,
      tipoPoliza,
      dependientesCompletos,
      errores,
    );
  });

  return errores;
}

function validarEmision(registros: RegistroExcel[]) {
  const errores: string[] = [];
  const obligatorios = [
    'CorreoClaims',
    'ContrasenaClaims',
    'UrlClaims',
  ];

  registros.forEach((registro, indice) => {
    if (esVacio(registro.EscenarioPrueba)) {
      return;
    }
    const fila = filaExcel(registro, indice);
    for (const campo of obligatorios) {
      if (esVacio(registro[campo])) {
        agregarError(errores, fila, campo, 'valor obligatorio vacío');
      }
    }
  });

  return errores;
}

export function validarEscenariosExcel<T>(
  nombreHoja: string,
  registros: T[],
) {
  const registrosExcel = registros as RegistroExcel[];
  let errores: string[] = [];

  switch (nombreHoja) {
    case 'CotizadorAF':
      errores = validarCotizador(registrosExcel);
      break;
    case 'ConfiguracionesPlan':
      errores = validarConfiguracionesPlan(registrosExcel);
      break;
    case 'PerfilesCotizacion':
      errores = validarPerfilesCotizacion(registrosExcel);
      break;
    case 'EmisionAF':
      errores = validarEmision(registrosExcel);
      break;
  }

  if (errores.length > 0) {
    throw new Error(
      `Datos inválidos en la hoja "${nombreHoja}":\n- ${errores.join('\n- ')}`,
    );
  }

  return registros;
}
