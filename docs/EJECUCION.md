# Ejecución y solución de problemas

## Requisitos

- Node.js 20 LTS recomendado.
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
| `npm run test:ci` | Ejecuta el smoke de CI/CD. | Cuatro recorridos etiquetados `@ci`, solo Chromium, headless y salida compacta. |
| `npm run test:ci:list` | Lista la selección de CI/CD sin abrir navegador. | Debe descubrir cuatro pruebas mientras se mantenga el perfil vigente. |
| `npm run test:ui` | Abre Playwright UI. | Útil para depuración interactiva. |
| `npm run build` | Valida TypeScript. | No genera `dist`. |
| `npm run merge-polizas` | Pretende consolidar archivos por worker. | Actualmente no inicia porque `ts-node` no está declarado como dependencia. |
| `npm run test:full` | Pretende ejecutar suite y consolidación. | La fase de consolidación está bloqueada por la ausencia de `ts-node`. |
| `npm run test:headless` | Pretende ejecutar sin UI. | Actualmente falla por el argumento `--headed=false`; ver Estado técnico. |
| `npm run clean` | Limpieza. | Actualmente usa sintaxis de Windows y no es portable a macOS/Linux. |

## Ejecuciones focalizadas

```bash
# Archivo actual
npx playwright test src/tests/cotizacionesAF.spec.ts --project=Chromium

# Describe Cotizador AF
npx playwright test --project=Chromium -g "Cotizador AF"

# Describe Emision Claims AF
npx playwright test --project=Chromium -g "Emision Claims AF"

# Escenario específico
npx playwright test --project=Chromium -g "Escenario: Emision 1"

# Repetición para investigar inestabilidad
npx playwright test --project=Chromium -g "texto del escenario" --repeat-each=3
```

Los nombres de proyecto distinguen mayúsculas: `Chromium` y `Firefox`.

## Variante CI/CD

`playwright.ci.config.ts` extiende la configuración normal y aplica `grep: /@ci/`. La selección se mantiene en `src/configuraciones/escenariosCI.ts` y actualmente cubre:

- evaluación BMI familiar;
- evaluación BMI individual;
- emisión Claims familiar;
- emisión Claims individual.

El smoke usa `CI_WORKERS`, un reintento y solamente Chromium para no sobrecargar el ambiente controlado. El workflow ejecuta este smoke de 4 casos en cada push y la regresión completa de 576 casos en las corridas programadas. Al iniciar manualmente el workflow, `tipo_ejecucion` ofrece `smoke` (4 casos), `rapida` (288 casos, todos los escenarios en Chromium) y `completa` (576 casos, Chromium y Firefox). Para cambiar el smoke se modifica únicamente el catálogo central, sin desactivar filas del Excel ni borrar escenarios.

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
- reporte de lista y HTML en la configuración base; el smoke usa puntos y HTML.
- trace retenido en fallas locales y en el primer reintento de CI.
- screenshot solo en fallas.
- video retenido en fallas locales y en el primer reintento de CI.

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
- Reporte HTML CI/CD: `Evidencias/reportes-ci/index.html`.
- Artefactos de ejecución: `test-results/`.
- Resultados de textos faltantes: `src/textosEsperados/textosFaltantes/`.
- Reportes de póliza por worker y consolidado: `src/Evidencias/` cuando se generan.

Consulta [Evidencias y reportes](EVIDENCIAS-Y-REPORTES.md).

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
