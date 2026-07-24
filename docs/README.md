# Documentación técnica

Este directorio contiene la referencia operativa y de mantenimiento de AutomatizacionAF. La documentación separa el comportamiento vigente de las recomendaciones futuras para no presentar como implementado algo que el código todavía no hace.

| Documento | Propósito | Audiencia |
|---|---|---|
| [Arquitectura](ARQUITECTURA.md) | Capas, dependencias, flujos y reglas de extensión. | QA Automation, desarrollo y revisión técnica. |
| [Ejecución](EJECUCION.md) | Instalación, comandos, filtros y solución de problemas. | Personas que ejecutan o diagnostican la suite. |
| [Datos de prueba](DATOS-DE-PRUEBA.md) | Libro Excel, hojas, columnas, valores y mantenimiento. | QA funcional y QA Automation. |
| [Estrategia de pruebas](ESTRATEGIA-DE-PRUEBAS.md) | Cobertura, criterios, riesgos y quality gates. | Equipo QA y responsables de entrega. |
| [Evidencias y reportes](EVIDENCIAS-Y-REPORTES.md) | Ubicaciones, generación, lectura y retención. | QA, soporte y auditoría. |
| [Seguridad](SEGURIDAD.md) | Secretos, datos personales y manejo de artefactos. | Todo contribuidor. |
| [Operación y mantenimiento](OPERACION-Y-MANTENIMIENTO.md) | Dependencias, Sonar, CI propuesto y mantenimiento periódico. | Maintainers. |
| [Estado técnico](ESTADO-TECNICO.md) | Hallazgos confirmados y deuda priorizada. | Maintainers y responsables técnicos. |
| [Contribución](../CONTRIBUTING.md) | Flujo de trabajo, convenciones y checklist de PR. | Contribuidores. |

## Fuentes de verdad

| Tema | Fuente vigente |
|---|---|
| Comandos y dependencias | `package.json` y `package-lock.json` |
| Descubrimiento y proyectos | `playwright.config.ts` → `src/configuraciones/playwright.config.ts` |
| Escenarios ejecutables | `src/datos/SuitePruebas.xlsx` |
| Orquestación de casos | `src/tests/cotizacionesAF.spec.ts` |
| Reglas de negocio automatizadas | `src/flows/` |
| Selectores y acciones UI | `src/paginas/` |
| Contratos de texto | `src/textosEsperados/` y `src/configuraciones/validacionesPantallas.ts` |

Si la documentación y el código difieren, primero confirma el comportamiento con las fuentes anteriores y actualiza ambos en el mismo cambio.

## Mantenimiento de esta documentación

- Actualiza el documento afectado al cambiar un comando, una hoja de datos, un flujo, un proyecto o una ruta de evidencia.
- No copies credenciales, tokens, folios reales ni datos personales a ejemplos.
- Marca las propuestas futuras como “recomendadas” o “pendientes”.
- Conserva enlaces relativos para que funcionen localmente y en GitHub.
- Registra hallazgos nuevos en [Estado técnico](ESTADO-TECNICO.md) con evidencia y prioridad.
