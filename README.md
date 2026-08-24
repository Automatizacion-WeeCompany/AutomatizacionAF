# AutomatizacionAF

Framework de automatización web end-to-end para los procesos de American Fidelity. El proyecto usa Playwright Test y TypeScript, organiza la automatización con Page Object Model (POM) más flujos de negocio y obtiene los escenarios desde Excel.

## Alcance actual

- Cotizador AF: matriz de 768 cotizaciones familiares e individuales, generada como perfiles × configuraciones comerciales × tres idiomas; valida emisión o evaluación BMI según el objetivo del caso.
- Emisión Claims AF: genera la póliza con los flujos del cotizador, conserva los datos capturados, abre esa misma póliza en Emisión, atiende la solicitud y compara las siete pestañas de Claims.
- Validación de tarifas: descubre todos los países de residencia disponibles y cruza cada uno con los 384 escenarios familiares e individuales de emisión en Esp/Eng/Port; exige tarifa positiva, ausencia de BMI y folio final.
- Árbol de suscripción: cubre edad, cálculo BMI/percentil, diagnósticos críticos, UW, PEP, documentos y enrutamiento a Nuevas/Pendientes/Rechazadas con datos deterministas.
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

- Node.js 22 LTS.
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

CI/CD dispone de perfiles independientes y acotados. El quality gate ejecuta
87 reglas sin navegador y dos recorridos smoke en Chromium; la cobertura
crítica restante rota durante la semana:

```bash
npm run test:ci:list
npm run test:ci
npm run test:ci:reglas
npm run test:ci:critical:list
```

La suite completa continúa disponible localmente y mediante ejecución manual;
no forma parte de los horarios automáticos. La selección CI está centralizada
en `src/configuraciones/escenariosCI.ts` y protegida por pruebas de contrato.
Los mensajes informativos se conservan en local y se silencian en CI. Para
investigar una corrida remota puede habilitarse temporalmente `CI_VERBOSE=1`.

Comandos útiles:

```bash
# Solo Chromium
npx playwright test --project=Chromium

# Solo Firefox
npx playwright test --project=Firefox

# Un perfil y configuración por nombre (flujo E2E con navegador)
npm run test:flujo:normal

# Misma revisión UW por BMI en cada idioma
npm run test:flujo:bmi:esp
npm run test:flujo:bmi:eng
npm run test:flujo:bmi:port

# Todos los recorridos E2E de Aplicación AF
npm run test:aplicacion

# Aplicación AF por idioma
npm run test:aplicacion:esp
npm run test:aplicacion:eng
npm run test:aplicacion:port

# Solo emisión directa
npm run test:aplicacion:emision

# Solo integración de emisión con WeeClaims
npm run test:integracion:claims

# Flujo independiente de validación de tarifas
npm run test:tarifas -- --project=Chromium

# Reglas de edad, BMI, rechazo, UW y bandejas (sin navegador ni solicitudes)
npm run test:reglas

# Interfaz de Playwright
npm run test:ui

# Smoke controlado de CI/CD
npm run test:ci

# Reglas y contratos del catálogo crítico, sin navegador
npm run test:ci:reglas

# Ocho recorridos críticos de Aplicación AF
npm run test:ci:critical

# Integración crítica AF a Claims
npm run test:ci:integration

# Una variante de tarifa y cinco países equidistantes
npm run test:ci:tarifas

# Ver el último reporte HTML
npx playwright show-report playwright-report
```

> Los specs de `src/tests/reglas/` validan el árbol de decisiones en memoria. Que
> termine en milisegundos y muestre solamente acciones `Expect` es el resultado
> esperado; para navegar la aplicación se deben usar `test:flujo:bmi`,
> `test:flujo:normal` o los comandos `test:aplicacion:*`.

La organización, identificadores y etiquetas se documentan en
[`docs/JERARQUIA-DE-PRUEBAS.md`](docs/JERARQUIA-DE-PRUEBAS.md).

La configuración base usa workers automáticos en local y `CI_WORKERS` en
ejecuciones CI amplias (3 por defecto, con límite de 4). Los perfiles E2E
focalizados fuerzan un solo worker; las reglas puras usan cuatro. `fullyParallel`
permanece deshabilitado en UI porque las cuentas de AF y Claims son compartidas.
Los proyectos se llaman exactamente `Chromium` y `Firefox`.

La automatización se divide en cuatro workflows: el quality gate valida reglas
y dos smoke; el nocturno ejecuta dos recorridos rotativos más una integración
Claims; el semanal valida los smoke en Firefox y una muestra de tarifas; y la
regresión manual permite elegir `smoke`, `critical`, `integration`, `tarifas`,
`reglas` o `full`. Los cuatro turnos nocturnos preservan emisión, BMI, todos los
perfiles, ocho parejas plan/red, cuatro frecuencias, cuatro deducibles y tres
idiomas. `full`
abarca 3246 tests entre Chromium y Firefox y se divide en cuatro shards, pero
solo debe lanzarse en una ventana autorizada. Cada variante exhaustiva de
tarifas recorre dinámicamente todos los países del selector y puede crear
muchas pólizas.

## Arquitectura

```text
SuitePruebas.xlsx
       │
       ▼
src/tests/**/*.spec.ts
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
