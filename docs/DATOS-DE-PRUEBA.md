# Datos de prueba

## Fuente principal

`src/datos/SuitePruebas.xlsx` es la fuente de los escenarios data-driven. Las cotizaciones se generan combinando dos catálogos independientes: configuraciones comerciales y perfiles de personas.

Reglas de activación:

- Solo filas con identificador no vacío participan en la generación.
- Los nombres de hoja y encabezado son sensibles a cambios de texto.
- Los valores funcionales se comparan como cadenas y, en varios flows, distinguen mayúsculas, acentos y espacios.
- Una fila se ejecuta una vez por cada proyecto Playwright seleccionado.

## Hojas

| Hoja | Estado | Uso |
|---|---|---|
| `ConfiguracionesPlan` | Activa | 24 combinaciones válidas de plan, red, deducible y frecuencia. |
| `PerfilesCotizacion` | Activa | Ocho perfiles: seis familiares y dos individuales. |
| `CotizadorAF` | Referencia heredada | Conserva los escenarios anteriores, pero los specs actuales ya no la consumen. |
| `EmisionAF` | Activa | Genera escenarios de emisión Claims. |
| `Hoja1` | No consumida | Contiene datos sin encabezado reconocido; el spec no la carga. Trátala como referencia hasta decidir su depuración. |

## Generación de la matriz

`GenerarEscenariosCotizador` calcula `ConfiguracionesPlan × PerfilesCotizacion`.
Con 24 configuraciones y ocho perfiles se obtienen 192 cotizaciones. Al usar
Chromium y Firefox, Playwright registra 384 ejecuciones del cotizador. La
emisión Claims agrega una prueba por navegador.

Antes de registrar los tests se valida:

- cobertura exacta de las seis parejas plan/red y los cuatro deducibles;
- unicidad de identificadores;
- cantidad de dependientes coherente con `1`, `2` o `3+`;
- cónyuge obligatorio en perfiles familiares;
- consistencia entre `ResultadoEsperado` y `ObjetivoBMI`;
- ausencia de dependientes en perfiles individuales.

## Hoja `ConfiguracionesPlan`

| Encabezado | Uso |
|---|---|
| `ConfiguracionPlan` | Identificador legible y único. |
| `CotizarPlan` | `Superior`, `Optima` o `Vital`. |
| `RedProveedores` | Red válida para el plan. |
| `Deducible` | Texto exacto de la opción de deducible. |
| `FrecuenciaPago` | Frecuencia configurada para la ejecución. |

Las parejas válidas son Superior–Ultra/Open, Optima–Ultra/Plus y
Vital–Plus/Core. Cada pareja se combina con los cuatro deducibles admitidos.

## Hoja `PerfilesCotizacion`

Contiene acceso, idioma, composición familiar, datos personales,
dependientes, cuestionarios y las dos columnas que gobiernan la salida:

| Encabezado | Contrato |
|---|---|
| `PerfilCotizacion` | Identificador único del perfil. |
| `TipoPoliza` | `Familiar` o `Individual`. |
| `ResultadoEsperado` | `Emision` o `EvaluacionBMI`. |
| `ObjetivoBMI` | `Ninguno`, `Titular` o `Dependiente1`…`Dependiente5`. |

Los perfiles vigentes son familiar con cónyuge y 1, 2 o 3+ dependientes,
tanto normales como con el titular objetivo de BMI; además de individual
normal e individual BMI. Los valores `Dependiente1`…`Dependiente5` siguen
siendo válidos para capturar estatura y peso fuera de rango, pero no forman
parte de la matriz activa: su resultado se validará en un flujo adicional
específico para dependientes.

## Hoja `CotizadorAF` (referencia heredada)

### Identidad y acceso: A–E

| Columna | Encabezado | Uso |
|---|---|---|
| A | `EscenarioPrueba` | Nombre y activación del test. |
| B | `Url` | Página inicial de AF. |
| C | `IdiomaCotizacion` | Rama de idioma: `Esp`, `Eng` o `Port`. |
| D | `CorreoInicio` | Usuario de prueba. |
| E | `Contrasena` | Credencial de prueba. No debe permanecer en texto plano a futuro. |

### Cotización: F–L

| Columna | Encabezado | Ejemplos de contrato funcional |
|---|---|---|
| F | `TipoPoliza` | `Familiar`, `Individual`. |
| G | `ConyugePareja` | `Si`, `No`. Vacío para `Individual`. |
| H | `HijosMenoresDe24` | Cantidad/opción visible, por ejemplo `3+`. Vacío para `Individual`. |
| I | `CotizarPlan` | Plan reconocido por el flow. |
| J | `RedProveedores` | Red reconocida por el flow. |
| K | `Deducible` | Texto exacto de la opción visible. |
| L | `FrecuenciaPago` | `Mensual`, `Trimestral`, `Semestral`, `Anual`. |

### Información personal: M–T

| Columna | Encabezado | Uso |
|---|---|---|
| M | `SexoAlNacer` | `Masculino` o `Femenino`. |
| N | `EstadoCivil` | Decisión del flow de información personal. |
| O | `TelefonoSecundario` | Agrega teléfono cuando es `Si`. |
| P | `EliminarTelSec` | Elimina teléfono agregado cuando es `Si`. |
| Q | `OcupacionTitular` | Opción exacta del selector. |
| R | `TipoIdentificacionTitular` | Opción exacta del selector. |
| S | `DireccionCorrespondencia` | Agrega dirección cuando es `Si`. |
| T | `EliminarDirCorr` | Elimina dirección agregada cuando es `Si`. |

### Dependientes y beneficiario: U–AE

| Columnas | Encabezados | Uso |
|---|---|---|
| U, W, Y, AA, AC | `Hijo1` … `Hijo5` | Tipo de relación del dependiente. Las celdas vacías se omiten. |
| V, X, Z, AB, AD | `SexoDependiente1` … `SexoDependiente5` | Sexo alineado por posición con cada dependiente. |
| AE | `RelacionSolicitantePrimario` | Relación usada al agregar beneficiario. |

Para una póliza `Individual`, las columnas U–AD deben permanecer vacías. El
flow valida este contrato antes de intentar agregar dependientes. En una
póliza `Familiar`, relación y sexo se conservan como pares por posición para
evitar que una celda intermedia vacía desalinee los datos.

Tipos de dependiente aceptados por el flow vigente:

- `Hijo Biológico`.
- `Hijastro`.
- `Hijo Adoptado Legalmente`.
- `Menor Bajo Custodia Legal`.

### Cuestionario médico: AF–AI

| Columna | Encabezado | Uso |
|---|---|---|
| AF | `CuestionarioMedicoCaptura` | Decide captura del cuestionario I. |
| AG | `P5Sustancia` | Sustancia seleccionada en la pregunta 5. |
| AH | `SigueIngiriendo` | Respuesta condicional de la pregunta 5. |
| AI | `CapturaPreguntasPt2` | Decide captura del cuestionario II. |

Las columnas binarias de los cuestionarios aceptan `Si`, `Sí` o `SI`, además
de `No`, sin depender de mayúsculas, acentos o espacios alrededor del valor.
Un contenido distinto falla antes de interactuar con la pantalla e identifica
la columna inválida. Cuando la respuesta es afirmativa, cada clic se verifica
contra el radio seleccionado antes de capturar los datos asociados.

Después del cuestionario II, la aplicación puede mostrar una sección médica
adicional. El código no la presupone por tipo de póliza o idioma: detecta si la
sección o la confirmación del plan quedó visible y continúa por el destino
correspondiente.

### Columnas reservadas o no conectadas

- AJ–AQ no tienen encabezado. No deben usarse como contrato de datos.
- AR–BF contienen encabezados y valores de esquema, pago, factura, nacimiento, estado civil y beneficiarios, pero el spec/flow actual no los consume.
- `EstadoCivil` aparece también en AV. Los encabezados duplicados pueden ser renombrados por la librería al convertir la hoja; el flow usa el campo de N.
- Las columnas de porcentajes usan el texto heredado `ProcentajeBenN`. No se debe “corregir” el encabezado sin cambiar primero el lector y el código consumidor.

## Hoja `EmisionAF`

| Columna | Encabezado | Uso |
|---|---|---|
| A | `EscenarioPrueba` | Nombre y activación del test. |
| B | `CorreoClaims` | Usuario de prueba de Claims. |
| C | `ContrasenaClaims` | Credencial de prueba. |
| D | `UrlClaims` | Página inicial de Emisión. |
| E | `FolioSolicitante` | Campo legado opcional; el flujo usa la póliza recién generada por el cotizador. |

La hoja aporta únicamente la configuración de acceso a Claims. Cada escenario de resultado `Emision` genera y conserva su propio número de póliza antes de ingresar al módulo.

## Tipado

`ConfiguracionPlanExcel`, `PerfilCotizacionExcel` y `EscenarioExcel` tipan los
tres estados del dato. `ValidarEscenariosExcel` y el generador fallan durante
el descubrimiento con mensajes de hoja, perfil o configuración cuando el
contrato no es válido.

## Contratos de textos

Los JSON en `src/textosEsperados/` contienen arreglos de textos esperados. La validación:

1. Lee todo el texto del body de la página o iframe.
2. Normaliza comillas rectas y tipográficas.
3. Busca cada cadena como contenido incluido.
4. Registra los faltantes en `src/textosEsperados/textosFaltantes/`.

Los archivos deben ser JSON válidos con un arreglo de cadenas. Los contratos en inglés y portugués referenciados por configuración no están presentes actualmente; esos idiomas no deben declararse cubiertos hasta agregarlos y ejecutarlos.

## Archivos de carga

- `PruebaAF.pdf`: documento usado en cargas del cuestionario y de identificación.
- `Firma.png`: archivo usado en pasos de firma.

Sustituye estos archivos únicamente por datos sintéticos. Mantén nombre y ruta o actualiza todos los Page Objects consumidores en el mismo cambio.

## Procedimiento para agregar un escenario

1. Decide si la variación pertenece al eje comercial o al perfil de personas.
2. Duplica una fila únicamente en la hoja correspondiente.
3. Asigna un identificador único y descriptivo.
4. Modifica solo los campos que definen la nueva cobertura.
5. Verifica que los valores coincidan con opciones reales de la UI.
6. Cierra Excel y elimina cualquier archivo temporal `~$...`.
7. Ejecuta `npm run build`.
8. Ejecuta `npx playwright test --list` y confirma el nuevo conteo.
9. Corre el escenario por nombre en un solo navegador.
10. Revisa reporte, video, trace y efectos creados en el ambiente.

## Seguridad y calidad de datos

- No guardes contraseñas, tokens o datos personales reales en el libro.
- No compartas el Excel fuera del canal autorizado.
- Usa usuarios y documentos sintéticos.
- No cambies nombres de hojas o encabezados sin actualizar código y documentación.
- Evita filas decorativas dentro del rango usado; pueden producir objetos inesperados.
- No versionar archivos temporales de Excel.
