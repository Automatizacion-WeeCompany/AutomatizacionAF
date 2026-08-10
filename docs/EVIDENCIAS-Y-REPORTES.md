# Evidencias y reportes

## Política Playwright vigente

`src/configuraciones/playwright.config.ts` configura:

| Evidencia | Política |
|---|---|
| Reportero de consola | `list` en la configuración base; `dot` en el smoke CI/CD. |
| Reporte HTML | Siempre; `playwright-report/` en la configuración base y `Evidencias/reportes-ci/` en el smoke. |
| Trace | Se conserva en falla local y en el primer reintento de CI. |
| Screenshot | Solo en falla. |
| Video | Se conserva en falla local y en el primer reintento de CI. |
| Apertura automática del HTML | Deshabilitada. |

Los artefactos permanecen disponibles en disco, pero los mensajes informativos no se imprimen en CI/CD. `CI_VERBOSE=1` permite reactivarlos temporalmente sin cambiar código.

## Ubicaciones

### `playwright-report/`

Salida HTML de la configuración local. Incluye `index.html` y recursos asociados.

```bash
npx playwright show-report playwright-report
```

### `Evidencias/reportes-ci/`

Salida HTML del smoke CI/CD. Se genera como archivo local del runner y está ignorada por Git. La consola solo muestra puntos, fallas y el resumen de Playwright; el detalle completo permanece en este reporte y en `test-results/`.

### `test-results/`

Artefactos por test, como trace, video, screenshot y contexto de error. Es una salida temporal y está ignorada por Git.

### `Evidencias/comparaciones-datos/`

Cada comparación de Emisión Claims genera un archivo inmutable en:

```text
Evidencias/comparaciones-datos/<numero-poliza>/<fecha>-<pid>-<consecutivo>.json
```

El archivo contiene identificador y fecha de ejecución, escenario, póliza, estado global, resumen, las siete pestañas y el detalle de cada campo (`esperado`, `obtenido`, estado y fuentes). Los estados globales son:

- `Exitosa`: no se encontraron diferencias.
- `ConDiferencias`: uno o más valores comparables no coinciden.
- `Error`: la lectura se interrumpió; se conserva lo comparado hasta ese momento y la etapa que falló.

Los campos sin valor capturado se registran como `NoComparable` y permanecen visibles en el resumen. Esta ruta está ignorada por Git.

### `src/textosEsperados/textosFaltantes/`

Resultados JSON de validaciones de contenido. El nombre incluye pantalla/idioma, fecha e identificador de worker. La función agrega resultados si el archivo del worker para ese día ya existe.

Actualmente hay resultados históricos versionados. A futuro conviene tratarlos como artefactos de ejecución, no como fuente del código, después de acordar retención y migrar lo que tenga valor como baseline.

### `src/Evidencias/`

Ruta usada por utilidades para:

- placeholders faltantes;
- `ReportePolizas_worker<id>.xlsx`;
- `ReportePolizas_Consolidado.xlsx`.

Esta ruta no es la misma que `Evidencias/reportes/` de Playwright.

## Reporte de pólizas

El diseño existente contempla:

- `Evidencias/polizas-generadas-worker-<id>.json`, un log por proceso de Playwright para evitar escrituras cruzadas.

1. `obtenerDatosConfirmacion()` extrae productos, pólizas y folios.
2. `guardarExcelConfirmacionHistorico()` escribe un libro por worker para evitar colisiones.
3. `consolidarReportesPolizas()` combina hojas `Resultado` en `ReportePolizas_Consolidado.xlsx`.

La utilidad de extracción/guardado no está invocada por el spec o los flows vigentes. Además, el script de consolidación depende de `ts-node`, que no está declarado en el proyecto. Actualmente `npm run merge-polizas` falla antes de leer archivos y `test:full` no puede completar su segunda fase. Después de corregir el ejecutor, todavía puede no haber insumos que consolidar hasta conectar la extracción al flujo.

## Lectura de una falla

1. Identifica proyecto, escenario y paso en la consola o HTML.
2. Abre la captura para el estado final.
3. Usa el video para la secuencia previa.
4. Abre el trace para DOM, red, consola, acciones y tiempos.
5. Revisa el campo del Excel y el JSON usado por el paso.
6. Clasifica la falla como producto, automatización, datos o ambiente.

No uses solo el screenshot para concluir una causa cuando el trace está disponible.

## Retención recomendada

| Artefacto | Ejecución exitosa | Ejecución fallida |
|---|---|---|
| Consola/listado | Resumen del job. | Resumen del job. |
| HTML | Retención corta o por release. | Conservar hasta cerrar análisis. |
| Video | Eliminar pronto si no aporta. | Conservar durante investigación. |
| Trace | No se genera con la política actual. | Conservar durante investigación. |
| Screenshot | No se genera con la política actual. | Conservar durante investigación. |
| Excel de pólizas | Según auditoría y sensibilidad. | Según auditoría y sensibilidad. |
| Textos faltantes | Consolidar como hallazgo. | Conservar hasta actualizar producto o baseline. |

La política definitiva debe alinearse con protección de datos y capacidad de almacenamiento de la organización.

## Reglas de seguridad

- No adjuntar reportes sin revisar usuarios, folios, documentos y datos personales.
- Tratar los JSON de comparación como datos sensibles: pueden contener nombres, teléfonos, correos, identificadores y direcciones sintéticas del ambiente de prueba.
- No publicar artefactos en repositorios o canales públicos.
- Restringir acceso y expiración en CI.
- Evitar registrar contraseñas, tokens o contenido de documentos.
- Usar nombres de escenario útiles sin incluir datos sensibles.

## Criterios para CI

Cuando se implemente CI:

- publicar HTML, trace, screenshot y video como artefactos del job;
- usar retención corta por defecto;
- subir artefactos incluso si el test falla;
- no versionar salidas generadas;
- separar resultados por navegador y ejecución;
- aplicar enmascaramiento y secretos protegidos.
