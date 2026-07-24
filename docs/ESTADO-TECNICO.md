# Estado técnico y deuda priorizada

## Resumen de auditoría

Fecha de revisión: 16 de julio de 2026.

Fortalezas confirmadas:

- Arquitectura reconocible `spec → flow → page object`.
- Escenarios data-driven desde Excel.
- Page Objects separados por pantalla y flows por proceso.
- Tipado TypeScript estricto habilitado.
- Evidencia Playwright configurada.
- Validaciones de textos y placeholders reutilizables.
- Compilación TypeScript exitosa.
- Descubrimiento exitoso de 18 tests en dos navegadores.

La auditoría fue estática y de configuración. No se ejecutó el recorrido UI completo porque opera sobre sistemas externos, usa cuentas/datos de prueba y puede crear registros.

## Hallazgos priorizados

| Prioridad | Hallazgo | Impacto | Acción recomendada |
|---|---|---|---|
| P0 | Credenciales en el Excel y token de Sonar versionado. | Exposición de acceso en historial Git y copias del repo. | Rotar y migrar a secretos protegidos. |
| P0 | Evidencias pueden contener datos personales, documentos, folios y firmas. | Riesgo de privacidad y distribución no autorizada. | Política de acceso, redacción y retención. |
| P1 | Contratos JSON de inglés y portugués referenciados pero ausentes. | Escenarios de esos idiomas pueden fallar por archivo faltante. | Agregar baselines validados o limitar cobertura declarada. |
| P1 | `EstadoCivil` tiene una rama que provoca error para `Casado(a)`. | Un valor aparentemente soportado no completa información personal. | Corregir la condición y añadir caso focalizado. |
| P1 | `npm run test:headless` usa `--headed=false`, opción inválida. | El comando documentado en scripts falla de inmediato. | Definir una configuración/proyecto headless portable. |
| P1 | `npm run clean` usa `rd`. | Falla fuera de Windows. | Sustituir por una solución Node portable. |
| P1 | `npm run merge-polizas` invoca `ts-node`, que no está declarado. | La consolidación y la segunda fase de `test:full` no pueden iniciar. | Declarar un ejecutor compatible o migrar el script a una alternativa soportada. |
| P1 | Configuración Sonar identifica otro proyecto y contiene token. | Métricas publicadas en destino incorrecto y riesgo de secreto. | Reconfigurar antes de usar como gate. |
| P1 | No existe CI versionada. | Calidad y ejecución dependen del entorno local. | Implementar pipeline por etapas con secretos protegidos. |
| P1 | Reporte de pólizas no está conectado al flujo. | `test:full` puede no producir consolidado. | Integrar extracción al estado final o retirar el script hasta completarlo. |
| P2 | Flows con selectores directos y logs de datos de solicitante. | Erosiona POM y puede exponer datos en consola. | Mover acciones a Page Objects y reducir logs sensibles. |
| P2 | Esperas fijas en validación, páginas y spec. | Mayor duración e intermitencia. | Reemplazar por condiciones observables al tocar cada flujo. |
| P2 | URLs distribuidas entre Excel, config y código. | Drift entre ambientes y cambios incompletos. | Centralizar configuración por ambiente. |
| P2 | `EscenarioExcel` cubre solo parte del libro. | Errores de encabezado llegan a runtime. | Tipos y validación integral por hoja. |
| P2 | Columnas sin encabezado, duplicado `EstadoCivil` y campos no consumidos. | Contrato de datos ambiguo. | Limpiar en migración compatible y documentada. |
| P2 | `~$SuitePruebas.xlsx`, `.scannerwork/` y resultados históricos están versionados. | Ruido, metadatos locales y conflictos. | Acordar retención, retirar del índice y ampliar `.gitignore`. |
| P2 | Aliases `@utils` y `@data` apuntan a directorios que no existen. | Futuros imports con alias fallarán. | Corregir aliases o crear estructura durante una migración. |
| P2 | `playwright.config.js` duplica la entrada TypeScript. | Riesgo de editar la fuente equivocada o quedar desactualizado. | Mantener una única fuente versionada. |
| P3 | Dependencias duplicadas de Faker (`faker` y `@faker-js/faker`). | Superficie de mantenimiento innecesaria. | Confirmar consumidores y conservar una. |
| P3 | Todos los escenarios viven en un spec. | Filtrado, ownership y evolución menos claros. | Separar por dominio sin duplicar setup. |

## Verificaciones realizadas

| Verificación | Resultado |
|---|---|
| `npm run build` | Exitosa. |
| `npx playwright test --list` | Exitoso: 18 tests en un archivo. |
| `npm run test:headless -- --list` | Falló: opción desconocida `--headed=false`. |
| `npm run merge-polizas` | Falló: `ts-node` no encontrado. |
| Lectura de `SuitePruebas.xlsx` | Exitosa: tres hojas; dos consumidas por el spec. |
| Revisión de Git | Sin cambios previos al inicio de la documentación. |
| Workflow CI | No existe `.github/workflows` versionado. |

El mensaje local sobre ausencia de Java aparece al iniciar comandos del shell, pero no impidió Node, TypeScript, Playwright ni la inspección del Excel. Java solo sería relevante si una herramienta adicional del entorno lo requiere.

## Orden recomendado de remediación

1. Rotar secretos y retirar datos sensibles del control de versiones.
2. Acordar ambiente, variables y cuentas sintéticas.
3. Corregir comandos rotos y configurar CI mínimo.
4. Completar o restringir contratos de idioma.
5. Corregir la rama de estado civil y añadir una prueba focalizada.
6. Conectar el estado final y reporte de pólizas.
7. Tipar y validar el Excel.
8. Reducir esperas fijas y selectores fuera de Page Objects.
9. Limpiar artefactos versionados y configuración duplicada.

## Regla de seguimiento

Cada remediación debe:

- vivir en un cambio acotado;
- conservar el comportamiento compartido;
- incluir prueba o verificación proporcional;
- actualizar este documento;
- registrar cualquier bloqueo de ambiente sin declarar una ejecución no realizada.
