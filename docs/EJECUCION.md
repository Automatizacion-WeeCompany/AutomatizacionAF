# Ejecución y solución de problemas

## Requisitos

- Node.js 22 LTS recomendado y usado por GitHub Actions.
- npm.
- Acceso al ambiente de pruebas y cuentas autorizadas.
- Permisos para escribir en `test-results/`, `Evidencias/` y `src/Evidencias/`.
- Chromium y Firefox administrados por Playwright.

El proyecto no declara todavía una versión de Node en `engines`, `.nvmrc` o equivalente. Por eso el equipo debe acordar una versión LTS y validarla en local y CI.

## Instalación reproducible

```bash
npm ci
npx playwright install chromium firefox
```

Usa `npm ci` cuando exista `package-lock.json`; evita regenerar el lockfile si el cambio no es de dependencias.

## Preflight

```bash
npm run build
npx playwright test --list
```

- `npm run build` ejecuta TypeScript con `--noEmit`.
- `--list` carga configuración y Excel, y confirma los tests descubiertos sin abrir la aplicación.
- Ninguno valida conectividad, credenciales, selectores ni estado funcional del ambiente.

## Comandos vigentes

| Comando | Uso | Observaciones |
|---|---|---|
| `npm test` | Ejecuta toda la suite. | Chromium y Firefox; navegador visible por configuración. |
| `npm run test:ci` | Ejecuta el smoke de CI/CD. | Dos recorridos críticos `@smoke`, Chromium por defecto, headless y un worker. |
| `npm run test:ci:list` | Lista el smoke sin abrir navegador. | Debe descubrir exactamente dos pruebas. |
| `npm run test:ci:reglas` | Ejecuta reglas y contratos de cobertura para CI. | 87 pruebas sin navegador, video, trace ni screenshot. |
| `npm run test:ci:nightly` | Ejecuta el turno nocturno. | Dos casos; requiere `CI_NIGHTLY_SLOT=1..4`. |
| `npm run test:ci:critical` | Ejecuta toda la selección crítica de Aplicación. | Ocho casos que cubren perfiles y ejes comerciales. |
| `npm run test:ci:integration` | Ejecuta la integración crítica AF a Claims. | Un caso familiar de emisión, comparación y aceptación. |
| `npm run test:ci:tarifas` | Ejecuta la muestra semanal de tarifas. | Una variante individual y cinco países equidistantes. |
| `npm run test:reglas` | Ejecuta las 87 pruebas de reglas y contratos CI. | Chromium, sin navegación ni creación de solicitudes. |
| `npm run test:aplicacion` | Ejecuta los 768 recorridos de Aplicación AF. | Chromium; 256 casos por cada idioma. |
| `npm run test:aplicacion:emision` | Ejecuta únicamente emisión directa. | 384 escenarios en Chromium. |
| `npm run test:aplicacion:uw-bmi` | Ejecuta únicamente revisión UW por BMI. | 384 escenarios en Chromium. |
| `npm run test:aplicacion:esp` | Ejecuta Aplicación AF en español. | 256 escenarios en Chromium. |
| `npm run test:aplicacion:eng` | Ejecuta Aplicación AF en inglés. | 256 escenarios en Chromium. |
| `npm run test:aplicacion:port` | Ejecuta Aplicación AF en portugués. | 256 escenarios en Chromium. |
| `npm run test:integracion:claims` | Ejecuta emisión y comparación con WeeClaims. | 384 escenarios en Chromium. |
| `npm run test:tarifas` | Ejecuta el flujo independiente de Validación de tarifas. | Producto cartesiano de países dinámicos y 384 variantes por navegador seleccionado. |
| `npm run test:tarifas:list` | Lista las 384 variantes de tarifa por navegador sin abrir la aplicación. | No puede contar los países porque se descubren en tiempo de ejecución. |
| `npm run test:ui` | Abre Playwright UI. | Útil para depuración interactiva. |
| `npm run build` | Valida TypeScript. | No genera `dist`. |
| `npm run merge-polizas` | Pretende consolidar archivos por worker. | Actualmente no inicia porque `ts-node` no está declarado como dependencia. |
| `npm run test:full` | Pretende ejecutar suite y consolidación. | La fase de consolidación está bloqueada por la ausencia de `ts-node`. |
| `npm run test:headless` | Ejecuta la suite en Chromium sin UI. | Usa `CI=1`; sigue siendo una ejecución amplia y no es el quality gate. |
| `npm run clean` | Limpieza. | Actualmente usa sintaxis de Windows y no es portable a macOS/Linux. |

## Ejecuciones focalizadas

```bash
# Reglas de decisión, sin navegador
npm run test:reglas

# Todos los recorridos de Aplicación AF
npm run test:aplicacion

# Emisión directa en Aplicación AF
npm run test:aplicacion:emision

# Revisión UW por BMI del titular
npm run test:aplicacion:uw-bmi

# Aplicación por idioma
npm run test:aplicacion:esp
npm run test:aplicacion:eng
npm run test:aplicacion:port

# Mismo caso focalizado de BMI en cada idioma
npm run test:flujo:bmi:esp
npm run test:flujo:bmi:eng
npm run test:flujo:bmi:port

# Integración de emisión y comparación con WeeClaims
npm run test:integracion:claims

# Validación exhaustiva de tarifas en Chromium
npm run test:tarifas -- --project=Chromium

# Una variante comercial; todavía recorre todos los países
npx playwright test src/tests/matriz-comercial/tarifas-por-pais.spec.ts --project=Chromium -g "MAT-TAR-097"

# Escenario específico por identificador estable
npx playwright test --project=Chromium -g "APP-UW-BMI-097"

# Repetición para investigar inestabilidad
npx playwright test --project=Chromium -g "texto del escenario" --repeat-each=3
```

Los nombres de proyecto distinguen mayúsculas: `Chromium` y `Firefox`.
Consulta [Jerarquía de pruebas](JERARQUIA-DE-PRUEBAS.md) para conocer los
prefijos, etiquetas y alcance de cada grupo.

## Variante CI/CD

`playwright.ci.config.ts` selecciona un perfil mediante `CI_PROFILE` y un
navegador mediante `CI_BROWSER`. El catálogo central
`src/configuraciones/escenariosCI.ts` asigna etiquetas sin desactivar filas del
Excel:

| Perfil | Selección | Uso automático |
|---|---|---|
| `smoke` | Dos recorridos: emisión individual y BMI familiar. | PR y push a `main`, Chromium. |
| `nightly` | Dos recorridos del slot `CI_NIGHTLY_SLOT`. | Lunes a viernes, Chromium. |
| `critical` | Los ocho recorridos de los cuatro slots. | Ejecución manual. |
| `integration` | Una emisión familiar integrada con Claims. | Nocturno y manual. |
| `tarifas` | Una variante individual y cinco países. | Semanal y manual. |

Los cuatro slots nocturnos cubren en conjunto los ocho perfiles, las ocho
parejas plan/red, las cuatro frecuencias, los cuatro deducibles, Esp/Eng/Port y
las salidas Emisión/BMI.
`src/tests/reglas/perfiles-ci.spec.ts` falla si ese contrato se reduce o duplica.
Los perfiles E2E usan un worker para proteger la cuenta compartida y un máximo
de una falla temprana —dos para `critical`—; las reglas puras usan cuatro
workers y no requieren instalar navegadores.

La matriz completa no tiene calendario. Sólo está disponible en
`regression-manual.yml`, se divide en cuatro shards y publica un único reporte
consolidado. Debe coordinarse con el ambiente porque puede crear gran cantidad
de pólizas y solicitudes.

La consola del smoke CI usa el reportero `dot`. Los mensajes informativos del framework se muestran localmente, pero se silencian cuando existe `CI`; los errores y el resumen de Playwright permanecen visibles. Para diagnóstico remoto:

```bash
CI_VERBOSE=1 npm run test:ci
```

## Configuración efectiva

La raíz carga `src/configuraciones/playwright.config.ts`. La configuración actual establece:

- `testDir`: `src/tests`.
- timeout por test: 180 segundos.
- `workers`: valor automático de Playwright en local y `CI_WORKERS` en CI/CD; el valor predeterminado es 3 y se limita a 4.
- `fullyParallel`: deshabilitado porque las cuentas y el ambiente son compartidos; el paralelismo queda limitado a grupos por archivo/proyecto.
- navegador visible en local y headless en CI para Chromium y Firefox.
- reporte de lista y HTML en local; CI usa puntos y HTML por perfil.
- trace retenido en fallas locales y en el primer reintento de CI.
- screenshot solo en fallas.
- video retenido únicamente cuando el test termina fallando.

Las URLs de navegación provienen principalmente del Excel; además existen URLs en configuración y aserciones. No cambies solo una fuente sin auditar las demás.

## Antes de una ejecución funcional

1. Cierra Excel para evitar archivos temporales o bloqueo del libro.
2. Revisa las hojas `CotizadorAF` y `EmisionAF`.
3. Confirma qué filas tienen `EscenarioPrueba`.
4. Verifica que las cuentas sean de prueba y el ambiente permita crear cotizaciones.
5. Confirma que los archivos `PruebaAF.pdf` y `Firma.png` existan.
6. Asegura que los JSON requeridos por el idioma estén presentes.
7. Elige un proyecto y un escenario focalizado antes de correr toda la matriz.

## Resultados y evidencia

- Reporte HTML local: `playwright-report/index.html`.
- Reporte HTML CI/CD: `Evidencias/reportes-ci/<perfil>/index.html`.
- Artefactos de ejecución: `test-results/`.
- Resultados de textos faltantes: `src/textosEsperados/textosFaltantes/`.
- Reportes de póliza por worker y consolidado: `src/Evidencias/` cuando se generan.
- Emisión y autorizaciones en Claims: `Evidencias/emision-claims/<poliza>/`.
- Validación de tarifas: `Evidencias/validacion-tarifas/<ejecucion>/`.

Consulta [Evidencias y reportes](EVIDENCIAS-Y-REPORTES.md).

El archivo de Validación de tarifas es intencionalmente exhaustivo. Cada una de
sus 384 variantes genera una póliza por cada país visible y conserva el resultado
aunque falle otro país del mismo escenario. No debe ejecutarse en producción ni
como smoke; para diagnosticar primero usa una variante con `-g`.

## Diagnóstico

### No se descubren tests

- Ejecuta `npx playwright test --list`.
- Verifica que el Excel exista y que la hoja tenga el nombre exacto.
- Confirma que `EscenarioPrueba` tenga valor; una fila vacía se ignora.
- Revisa que el archivo no esté abierto con un lock temporal que haya reemplazado datos.

### Falla al leer un JSON

La validación de idioma lanza error si el archivo configurado no existe. Confirma el mapeo en `validacionesPantallas.ts` y el archivo real en `src/textosEsperados/`. La configuración referencia contratos en inglés y portugués que actualmente no están versionados.

### El selector funciona en una página pero no en el cotizador

El cotizador opera dentro de `iframe#ifCotizador`. La acción debe usar el frame correcto, preferentemente dentro del Page Object.

### La ejecución queda esperando

- Revisa la primera operación que excede el timeout en el trace.
- Confirma que el ambiente responda y que no haya un modal inesperado.
- Prefiere esperar una condición visible en lugar de aumentar timeouts globales.
- Verifica si un valor del Excel entra en una rama no soportada.

### No aparece el consolidado de pólizas

- El script actual falla antes de consolidar porque no encuentra `ts-node`; primero debe corregirse la dependencia o adoptarse otro ejecutor TypeScript.
- Confirma la existencia de `src/Evidencias/ReportePolizas_worker*.xlsx`.
- Verifica que cada archivo tenga una hoja `Resultado`.
- La utilidad de extracción y guardado no está conectada al spec vigente; `test:full` puede no tener insumos que consolidar.

### El comando headless falla

El script actual usa una opción que Playwright no reconoce. Hasta corregir la configuración de forma explícita, no documentes `npm run test:headless` como quality gate.

### El comando clean falla en macOS/Linux

El script usa `rd`, propio de Windows. Limpia manualmente solo artefactos ignorados y evita borrar archivos de datos o cambios del usuario.

## Ejecución responsable

No ejecutes la suite contra producción ni contra cuentas reales. Los recorridos escriben información, cargan documentos y pueden crear registros. Toda corrida debe tener ambiente, cuenta, propósito y responsable identificables.
