# AutomatizacionAF

Framework de automatización web end-to-end para los procesos de American Fidelity. El proyecto usa Playwright Test y TypeScript, organiza la automatización con Page Object Model (POM) más flujos de negocio y obtiene los escenarios desde Excel.

## Alcance actual

- Cotizador AF: matriz de 192 cotizaciones familiares e individuales, separada en perfiles reutilizables y combinaciones de plan/red/deducible; valida emisión o evaluación BMI según el objetivo del caso.
- Emisión Claims AF: genera la póliza con los flujos del cotizador, conserva los datos capturados, abre esa misma póliza en Emisión, atiende la solicitud y compara las siete pestañas de Claims.
- Validación de textos por idioma a partir de archivos JSON.
- Evidencias Playwright: reporte HTML, video, captura y trace según la política configurada.
- Evidencia JSON inmutable por cada comparación en `Evidencias/comparaciones-datos/<póliza>/`.
- Utilidades para registrar y consolidar datos de pólizas en Excel; su integración completa con el flujo aún está pendiente.

## Tecnologías

- Node.js y npm.
- Playwright Test.
- TypeScript.
- `xlsx` para lectura de escenarios.
- `exceljs` para reportes tabulares.
- Faker para datos sintéticos.

## Inicio rápido

Requisitos recomendados:

- Node.js 20 LTS.
- npm.
- Acceso autorizado al ambiente de pruebas.
- Chromium y Firefox instalados por Playwright.

```bash
npm ci
npx playwright install chromium firefox
npm run build
npx playwright test --list
```

La ejecución completa abre navegadores por defecto y opera sobre sistemas externos. Antes de correrla, revisa los escenarios activos y confirma que el ambiente y las cuentas de prueba sean los correctos.

```bash
npm test
```

CI/CD dispone de una variante smoke independiente. Ejecuta cuatro recorridos representativos únicamente en Chromium y usa salida compacta:

```bash
npm run test:ci:list
npm run test:ci
```

La suite completa continúa disponible localmente; la selección CI está centralizada en `src/configuraciones/escenariosCI.ts`. Los mensajes informativos se conservan en local y se silencian en CI. Para investigar una corrida remota puede habilitarse temporalmente `CI_VERBOSE=1`.

Comandos útiles:

```bash
# Solo Chromium
npx playwright test --project=Chromium

# Solo Firefox
npx playwright test --project=Firefox

# Un perfil y configuración por nombre
npx playwright test --project=Chromium -g "Individual Normal | Superior Ultra Anual"

# Solo cotizaciones familiares
npx playwright test src/tests/cotizacionesFamiliaresAF.spec.ts --project=Chromium

# Interfaz de Playwright
npm run test:ui

# Smoke controlado de CI/CD
npm run test:ci

# Ver el último reporte HTML
npx playwright show-report playwright-report
```

La configuración usa workers automáticos en local y `CI_WORKERS` en CI/CD (3 por defecto, con límite de 4). `fullyParallel` permanece deshabilitado porque las cuentas de AF y Claims son compartidas. Los proyectos se llaman exactamente `Chromium` y `Firefox`.

La ejecución manual permite elegir `smoke` (4 casos en Chromium), `rapida` (los 288 casos funcionales en Chromium) o `completa` (576 casos en Chromium y Firefox). Los pushes usan smoke y las ejecuciones programadas conservan la regresión completa.

## Arquitectura

```text
SuitePruebas.xlsx
       │
       ▼
src/tests/*.spec.ts
       │ orquesta
       ▼
src/flows/*.flow.ts
       │ compone
       ▼
src/paginas/*Page.ts
       │ controla
       ▼
Aplicaciones AF y Claims

Utilidades + textos esperados ──► validaciones, datos y evidencias
```

Reglas principales:

- Los specs describen escenarios y llaman flujos.
- Los flows expresan pasos de negocio y aserciones de proceso.
- Los Page Objects encapsulan selectores y acciones de interfaz.
- Los datos de prueba no se duplican dentro de los tests.
- Las utilidades transversales no deben depender de una página concreta.

Consulta [Arquitectura](docs/ARQUITECTURA.md) para responsabilidades y reglas de extensión.

## Estructura del repositorio

```text
.
├── playwright.config.ts              # Entrada de configuración
├── src/
│   ├── configuraciones/               # Playwright y validaciones por pantalla
│   ├── datos/                         # Excel y archivos usados en cargas
│   ├── flows/                         # Flujos de negocio
│   ├── paginas/                       # Page Objects
│   ├── tests/                         # Specs Playwright
│   ├── textosEsperados/               # Contratos de contenido y resultados
│   ├── types/                         # Tipos del dominio de pruebas
│   └── utilidades/                    # Datos, validación y reportes
├── Evidencias/reportes/               # Reporte HTML de Playwright
├── docs/                              # Documentación técnica
└── CONTRIBUTING.md                    # Convenciones de cambio
```

## Documentación técnica

- [Índice de documentación](docs/README.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Ejecución y solución de problemas](docs/EJECUCION.md)
- [Datos de prueba](docs/DATOS-DE-PRUEBA.md)
- [Estrategia de pruebas](docs/ESTRATEGIA-DE-PRUEBAS.md)
- [Evidencias y reportes](docs/EVIDENCIAS-Y-REPORTES.md)
- [Seguridad](docs/SEGURIDAD.md)
- [Operación y mantenimiento](docs/OPERACION-Y-MANTENIMIENTO.md)
- [Estado técnico y deuda priorizada](docs/ESTADO-TECNICO.md)
- [Guía de contribución](CONTRIBUTING.md)

## Seguridad

El repositorio y sus artefactos de prueba pueden contener credenciales, datos personales, folios, capturas, videos y trazas. No agregues secretos nuevos al Excel, al código, a archivos de propiedades ni a los reportes. Usa cuentas sintéticas y gestiona secretos mediante variables protegidas o el mecanismo aprobado por el equipo. Revisa [Seguridad](docs/SEGURIDAD.md) antes de compartir evidencias o habilitar CI.

## Validación mínima de un cambio

```bash
npm ci
npm run build
npx playwright test --list
```

La ejecución UI debe ser proporcional al cambio y realizarse únicamente contra un ambiente autorizado. La compilación y el listado validan tipado y descubrimiento; no prueban la aplicación ni sustituyen un recorrido end-to-end.
