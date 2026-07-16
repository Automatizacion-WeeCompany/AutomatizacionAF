# Seguridad

## Alcance

La automatización procesa credenciales, folios, formularios, documentos, capturas, videos y trazas. Aunque el objetivo sea QA, estos elementos pueden contener información sensible y deben recibir el mismo cuidado que los datos de una aplicación.

## Principios

- Usar únicamente cuentas, documentos y personas sintéticas.
- Aplicar mínimo privilegio a usuarios de automatización.
- Mantener secretos fuera del repositorio.
- Ejecutar solo contra ambientes autorizados.
- Limitar acceso y retención de evidencias.
- Rotar cualquier secreto que haya sido versionado.

## Hallazgos actuales

La auditoría encontró valores sensibles en fuentes versionadas:

- credenciales dentro de `SuitePruebas.xlsx`;
- un token dentro de `sonar-project.properties`;
- salidas de Sonar bajo `.scannerwork/`;
- reportes históricos y archivos temporales de Excel versionados;
- URLs de ambiente distribuidas entre Excel, configuración y código.

Este documento no reproduce los valores. Deben asumirse expuestos al historial del repositorio, rotarse y migrarse con un cambio controlado.

## Gestión recomendada de secretos

Objetivo:

1. Variables de entorno locales cargadas desde un archivo ignorado.
2. Secretos protegidos del proveedor de CI.
3. Un mapeo por ambiente para URLs y usuarios.
4. Excel limitado a datos funcionales no secretos.
5. Mensajes de error que identifiquen la variable faltante sin imprimir su valor.

Nombres sugeridos para una migración futura:

```text
AF_BASE_URL
AF_USER
AF_PASSWORD
CLAIMS_BASE_URL
CLAIMS_USER
CLAIMS_PASSWORD
SONAR_TOKEN
```

No se agregan todavía porque el código actual no los consume; la migración debe cambiar código, documentación y pipeline en el mismo PR.

## Datos personales y documentos

- `PruebaAF.pdf` y `Firma.png` deben contener solo material sintético.
- Faker reduce el uso de datos reales, pero la información generada puede terminar en ambientes persistentes.
- Define limpieza, caducidad o prefijos para identificar registros de automatización.
- No copies datos visibles de una corrida a issues públicos.

## Evidencias

Video, trace y screenshots pueden capturar formularios completos. Antes de compartir:

1. verifica que el canal sea privado y autorizado;
2. elimina o redacta datos innecesarios;
3. evita incluir credenciales en pasos o logs;
4. configura expiración;
5. elimina copias locales cuando termine la investigación.

## SonarQube

- El token no debe vivir en `sonar-project.properties`.
- Debe inyectarse como secreto durante la ejecución.
- Los metadatos `.scannerwork/` son salida de herramienta y no deberían versionarse.
- Rota el token actual porque eliminarlo del último commit no lo borra del historial.
- Revisa que project key, nombre y enlaces correspondan a AutomatizacionAF antes de habilitar el análisis como gate.

## Dependencias

Proceso recomendado:

```bash
npm ci
npm audit
npm run build
npx playwright test --list
```

- Actualiza dependencias en cambios aislados.
- Revisa release notes de Playwright antes de saltos mayores.
- Regenera `package-lock.json` solo con la versión de npm acordada.
- No ignores vulnerabilidades sin riesgo, responsable y fecha de revisión.

## Reporte de incidente

Si se detecta un secreto o dato real:

1. no lo copies a comentarios o tickets abiertos;
2. notifica por el canal de seguridad aprobado;
3. revoca o rota el secreto;
4. contiene los artefactos y accesos;
5. evalúa el historial Git y caches de CI;
6. registra acciones sin repetir el valor expuesto.
