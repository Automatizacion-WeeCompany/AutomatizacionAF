# Arquitectura

## Objetivo

La arquitectura busca que los tests sean legibles y que el detalle de interfaz sea reutilizable. Sigue el mismo criterio usado en otros proyectos de automatización del equipo: `spec → flow → page object`, complementado aquí con datos Excel, contratos JSON y utilidades transversales.

No se propone una refactorización total. Toda extensión debe reutilizar las capas existentes y evitar duplicar selectores, pasos o lectores de datos.

## Vista de componentes

```mermaid
flowchart TD
    X["SuitePruebas.xlsx"] --> L["CargaDatosExcel / ObtencionDeDatos"]
    L --> S["Specs Playwright"]
    S --> F["Flows de negocio"]
    F --> P["Page Objects"]
    P --> UI["AF Broker / Claims"]
    J["JSON de textos esperados"] --> V["Validación de pantallas e idiomas"]
    V --> F
    U["Utilidades transversales"] --> F
    S --> R["Reporter Playwright"]
    R --> E["Evidencias y reporte HTML"]
```

## Capas y responsabilidades

### Specs: `src/tests/`

Responsabilidad:

- Convertir cada fila activa de Excel en un test.
- Instanciar y llamar flows en el orden del escenario.
- Seleccionar el alcance funcional del caso.

No deben contener selectores, generación detallada de datos ni lógica extensa de pantalla. El spec actual contiene los recorridos de Cotizador AF y Emisión Claims AF en un solo archivo; separarlos es una mejora futura, no un requisito para extender un caso existente.

### Flows: `src/flows/`

Responsabilidad:

- Orquestar varias acciones de Page Objects.
- Interpretar valores funcionales del Excel.
- Expresar bifurcaciones de negocio.
- Ejecutar validaciones que determinan el avance del flujo.

Los flows no deberían repetir selectores. Actualmente existen accesos directos a `page.locator()` en algunos flows; deben considerarse excepciones heredadas y migrarse gradualmente cuando se modifique esa zona.

### Page Objects: `src/paginas/`

Responsabilidad:

- Encapsular selectores.
- Exponer acciones atómicas sobre la interfaz.
- Ocultar detalles de iframe, carga de archivos, escritura y clics.

Reglas:

- Reutilizar el Page Object existente antes de crear otro.
- Preferir localizadores estables: roles, etiquetas, texto contractual o identificadores controlados.
- Mantener los `frameLocator('iframe#ifCotizador')` dentro de esta capa cuando la acción pertenece al cotizador.
- No incluir un recorrido completo de negocio en una sola acción de página.

### Configuración: `src/configuraciones/`

- `playwright.config.ts`: define directorio de pruebas, timeout, workers, reporteros, proyectos y política de evidencia.
- `validacionesPantallas.ts`: mapea una pantalla a iframe, placeholders y archivos de textos por idioma.

El `playwright.config.ts` de la raíz es el punto de entrada y reexporta la configuración de `src/configuraciones/`. Debe editarse la fuente TypeScript, no el archivo JavaScript heredado de la raíz.

### Datos y contratos

- `src/datos/SuitePruebas.xlsx`: escenarios data-driven.
- `src/datos/PruebaAF.pdf` y `src/datos/Firma.png`: adjuntos usados por los recorridos.
- `src/textosEsperados/`: listas de textos que actúan como contrato de contenido.
- `src/types/EscenarioExcel.ts`: tipado parcial de datos personales.

Consulta [Datos de prueba](DATOS-DE-PRUEBA.md) para el contrato detallado.

### Utilidades: `src/utilidades/`

- Lectura y extracción de Excel.
- Validación de textos e idiomas.
- Generación de datos sintéticos.
- Selección y espera de opciones dinámicas.
- Extracción y consolidación de datos de póliza.

Una utilidad debe ser independiente de un flujo particular siempre que sea posible. Si necesita selectores exclusivos de una pantalla, la acción pertenece a un Page Object.

## Flujos funcionales vigentes

### Cotizador AF

```mermaid
flowchart LR
    A["Login AF"] --> B["Home"]
    B --> C["Nueva cotización"]
    C --> D{"Tipo de póliza"}
    D -->|Individual| DI["Titular sin dependientes"]
    D -->|Familiar| DF["Cónyuge e hijos configurados"]
    DI --> E["Plan, red, deducible y frecuencia"]
    DF --> E
    E --> F["Resumen de cotización"]
    F --> G["Resumen de planes"]
    G --> H["Información personal y beneficiarios"]
    H --> I["Cuestionario médico I"]
    I --> J["Cuestionario médico II"]
    J --> K["Confirmación del plan"]
    K --> L["Términos"]
    L --> M["Declaración y firmas"]
    M --> N{"Resultado de suscripción"}
    N -->|Estándar| O["Pago"]
    N -->|Fuera de estándar| P["Evaluación"]
```

El flujo genera datos personales sintéticos para varios campos y toma del Excel las decisiones funcionales que cambian el camino.

Las pólizas `Individual` y `Familiar` comparten login, planes, datos del
titular, beneficiario, cuestionarios y aceptación. La variante individual
omite las columnas de cónyuge e hijos y usa 180 cm / 180 kg para ejercer la
ruta fuera de estándar: después de las firmas valida el mensaje de evaluación
y confirma que los controles de pago no aparezcan. Después de las 18 preguntas
de antecedentes médicos, el flow espera uno de dos destinos observables:
confirmación del plan o la sección médica adicional. Esta última se responde
solo cuando la aplicación la muestra para los solicitantes capturados.

### Emisión Claims AF

1. Navega a la URL proporcionada por la hoja `EmisionAF`.
2. Inicia sesión.
3. Abre Emisión.
4. Localiza la cotización por folio.
5. Recorre Información general, Coberturas, Cuestionario, Plan y frecuencia, Idioma, Limitaciones y Contrato.

La implementación actual lee información del solicitante y la registra en consola, pero no la compara con un resultado esperado tipado.

## Flujo de datos

1. Playwright importa el spec durante el descubrimiento.
2. `ExtraerDatosExcel.obtenerEscenariosPorHoja()` abre `SuitePruebas.xlsx`.
3. `CargarExcel` transforma la hoja en objetos usando la fila de encabezados.
4. Solo las filas con `EscenarioPrueba` no vacío se convierten en tests.
5. El spec pasa valores a los flows.
6. Los flows interpretan cadenas como `Esp`, `Familiar`, `Individual`, `Si`, plan, red y frecuencia.
7. Los Page Objects ejecutan acciones en la interfaz.
8. Playwright captura evidencias conforme a la configuración.

## Regla para agregar funcionalidad

1. Verificar si el Page Object y el flow ya existen.
2. Agregar o reutilizar una acción UI en `src/paginas/`.
3. Orquestar la nueva conducta en `src/flows/`.
4. Ampliar `EscenarioExcel` si el flow consume una columna nueva.
5. Añadir la columna o fila en Excel sin alterar encabezados vigentes.
6. Actualizar contratos JSON si cambia contenido visible.
7. Mantener el spec como orquestador.
8. Ejecutar compilación, descubrimiento y el recorrido focalizado.

## Dependencias permitidas

```text
tests ──► flows ──► paginas
  │          │          │
  └────────► datos, tipos y utilidades transversales
```

Evitar dependencias en sentido contrario: un Page Object no debe importar un flow o un spec; una utilidad genérica no debe importar una prueba concreta.

## Decisiones de diseño para cambios futuros

- Preservar nombres y selectores existentes cuando el cambio no requiere modificarlos.
- Compartir lógica en lugar de duplicar clases por escenario o idioma.
- Mantener aserciones de negocio observables; un clic exitoso no demuestra por sí solo que el paso terminó.
- Sustituir esperas fijas por condiciones visibles cuando se toque el código correspondiente.
- Centralizar URLs y secretos fuera del Excel/código en una migración controlada.
- Introducir fixtures solo si resuelven setup repetido y pueden adoptarse sin romper los flows vigentes.
