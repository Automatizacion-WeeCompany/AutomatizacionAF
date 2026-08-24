# Jerarquía de pruebas

## Objetivo

La suite se organiza por intención de negocio y resultado esperado. Los flows,
Page Objects, datos, filtros y aserciones funcionales se reutilizan sin cambios;
la ubicación del spec, su identificador, título, etiquetas y anotaciones explican
por qué existe cada prueba y qué resultado demuestra.

## Árbol vigente

```text
src/tests/
├── reglas/                         01. Reglas de decisión, sin UI
│   ├── edad.spec.ts
│   ├── antropometria.spec.ts
│   ├── diagnosticos-criticos.spec.ts
│   ├── revision-uw-medica.spec.ts
│   ├── enrutamiento.spec.ts
│   └── perfiles-ci.spec.ts
├── aplicacion/                     02. Aplicación AF, E2E
│   ├── emision-directa.spec.ts
│   └── revision-uw/
│       └── bmi-titular.spec.ts
├── integracion/                    03. Integración entre sistemas
│   └── weeclaims/
│       └── emision-y-comparacion.spec.ts
├── matriz-comercial/               05. Variaciones comerciales
│   └── tarifas-por-pais.spec.ts
└── soporte/                        Constructores compartidos de tests
```

Los grupos `04. Integraciones complementarias` y `06. Contratos de interfaz`
quedan reservados para pruebas específicas futuras. No se crearon casos vacíos
ni se trasladaron validaciones existentes a una categoría que todavía no
demuestran de forma independiente.

## Convención de identificadores

| Prefijo | Propósito |
|---|---|
| `REG-EDAD` | Reglas de edad. |
| `REG-BMI` | Cálculo y decisión antropométrica. |
| `REG-DX-CRIT` | Diagnósticos críticos de titular o dependiente. |
| `REG-UW-DX` | Diagnósticos no críticos que requieren UW. |
| `REG-UW-PREG` | Preguntas que requieren UW sin excepción. |
| `REG-UW-FORM` | Selección de formularios médicos. |
| `REG-RUTA` | Información general, precedencia y bandejas. |
| `REG-CI` | Invariantes de selección y cobertura de los perfiles CI/CD. |
| `APP-EMI` | Aplicación completa con emisión y pago. |
| `APP-UW-BMI` | Aplicación con evaluación BMI y sin pago. |
| `INT-CLAIMS-EMI` | Emisión, comparación y aceptación en WeeClaims. |
| `MAT-TAR` | Tarifa por variante comercial y país. |

El título sigue la forma:

```text
<ID> | <actor y condición> → <resultado observable> | <variante>
```

## Etiquetas

- Tipo: `@regla`, `@e2e`, `@integracion`, `@matriz`.
- Disparador: `@edad`, `@bmi`, `@diagnostico`,
  `@informacion-general`, `@cobertura-previa`.
- Resultado: `@emision`, `@uw`, `@bloqueo`, `@rechazo`, `@exclusion`.
- Asegurado o composición: `@titular`, `@dependiente`, `@individual`,
  `@familiar`.
- Idioma: `@esp`, `@eng`, `@port`.
- Selección operativa: `@smoke`, `@nightly-1`…`@nightly-4`,
  `@integracion-ci`, `@tarifa-ci` y `@tarifas`.

## Contrato de preservación

Esta jerarquía no redefine cobertura. Después de la reorganización se deben
mantener:

- 768 recorridos de Aplicación AF por navegador: 256 por cada idioma;
- 384 integraciones de emisión con WeeClaims por navegador;
- 384 variantes de tarifas por navegador, cada una recorriendo sus países;
- 83 reglas de decisión y cuatro contratos del catálogo CI por navegador;
- 1623 pruebas por navegador y 3246 con Chromium y Firefox;
- dos recorridos `@smoke`;
- ocho recorridos críticos distribuidos en cuatro slots nocturnos;
- una integración Claims y una variante de tarifas seleccionadas para CI;
- los mismos flows, datos Excel y aserciones que determinan el resultado.

Una configuración comercial es una variante, no un propósito funcional nuevo.
Los escenarios E2E continúan recorriendo la matriz vigente para preservar la
cobertura actual, pero sus títulos distinguen el objetivo funcional de la
configuración usada.

El idioma es un eje independiente: `PerfilesCotizacion × ConfiguracionesPlan ×
Esp/Eng/Port`. No se duplican filas del Excel ni flows para conseguir esta
cobertura. Las reglas puras que no dependen de interfaz no se triplican; sus
casos localizados validan explícitamente los tres estados traducidos.

## Ejecución por intención

```bash
npm run test:reglas
npm run test:aplicacion
npm run test:aplicacion:emision
npm run test:aplicacion:uw-bmi
npm run test:aplicacion:esp
npm run test:aplicacion:eng
npm run test:aplicacion:port
npm run test:integracion:claims
npm run test:tarifas -- --project=Chromium
npm run test:ci:reglas
npm run test:ci
npm run test:ci:critical
npm run test:ci:integration
npm run test:ci:tarifas
```
