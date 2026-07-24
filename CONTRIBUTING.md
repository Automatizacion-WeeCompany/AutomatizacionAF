# Contribución

## Principios

- Reutilizar antes de crear.
- Preservar selectores y comportamiento compartido cuando no sea necesario cambiarlos.
- Mantener la separación `spec → flow → page object`.
- No agregar secretos ni datos personales reales.
- Hacer cambios pequeños, verificables y documentados.

## Antes de empezar

1. Lee [Arquitectura](docs/ARQUITECTURA.md).
2. Revisa [Estado técnico](docs/ESTADO-TECNICO.md) para no duplicar una remediación.
3. Ejecuta `git status --short` y conserva cambios ajenos.
4. Identifica Page Objects, flows, datos y JSON relacionados.
5. Confirma el ambiente y el alcance de ejecución permitidos.

## Dónde hacer cada cambio

| Necesidad | Ubicación |
|---|---|
| Selector o acción UI | `src/paginas/` |
| Recorrido o regla de negocio | `src/flows/` |
| Orquestación del caso | `src/tests/` |
| Escenario funcional | `src/datos/SuitePruebas.xlsx` |
| Texto esperado | `src/textosEsperados/` |
| Mapeo por pantalla/idioma | `src/configuraciones/validacionesPantallas.ts` |
| Helper transversal | `src/utilidades/` |
| Contrato TypeScript | `src/types/` |

No crees un Page Object paralelo para una pantalla existente ni copies un flow para una variante de datos.

## Flujo recomendado

1. Crea una rama asociada al ticket siguiendo la convención del equipo.
2. Implementa el cambio mínimo en la capa correcta.
3. Actualiza datos, contratos y documentación en el mismo cambio.
4. Ejecuta los quality gates.
5. Revisa que el diff no incluya credenciales ni artefactos.
6. Documenta qué se ejecutó y qué quedó bloqueado.

## Convenciones

### Specs

- Nombre de escenario legible y orientado a negocio.
- Sin selectores directos.
- Sin esperas fijas nuevas.
- Sin credenciales o URLs nuevas hardcodeadas.
- Llamar flows en el orden observable del recorrido.

### Flows

- Componer acciones existentes.
- Validar estados intermedios y final.
- Interpretar los valores del Excel con errores claros.
- Mover selectores a Page Objects.
- Evitar duplicar lógica por idioma o navegador.

### Page Objects

- Una responsabilidad de pantalla o componente.
- Acciones pequeñas y reutilizables.
- Localizadores estables.
- Iframe encapsulado.
- No incluir datos secretos ni reglas completas de negocio.

### Datos

- Encabezados existentes son contratos.
- Valores sensibles fuera del libro en una migración coordinada.
- `EscenarioPrueba` único y descriptivo.
- Folios e identificadores conservados como texto.
- Archivos de carga exclusivamente sintéticos.

### Commits

Usa mensajes claros y consistentes, por ejemplo:

```text
feat(cotizador): agrega validacion del estado final
fix(datos): valida encabezados obligatorios de emision
docs(arquitectura): documenta flujo de evidencias
```

## Verificación

Base obligatoria para código, configuración o datos:

```bash
npm ci
npm run build
npx playwright test --list
```

Después ejecuta el caso focalizado:

```bash
npx playwright test --project=Chromium -g "nombre del escenario"
```

Incluye Firefox cuando cambien selectores, navegación o compatibilidad. No ejecutes recorridos externos sin autorización.

## Checklist de pull request

- [ ] El cambio está en la capa correcta.
- [ ] Se reutilizó código existente y no se duplicaron selectores o flows.
- [ ] El spec sigue siendo orquestador.
- [ ] Los datos y tipos están sincronizados.
- [ ] Los JSON de idioma requeridos existen.
- [ ] No hay secretos, datos reales ni artefactos temporales.
- [ ] `npm run build` pasa.
- [ ] `npx playwright test --list` descubre lo esperado.
- [ ] El escenario focalizado fue ejecutado o el bloqueo quedó explicado.
- [ ] Se revisaron reporte y trace cuando hubo ejecución.
- [ ] README y documentación afectada están actualizados.

## Revisión

La revisión debe comprobar:

- corrección funcional y estado final observable;
- estabilidad de selectores y esperas;
- coherencia de Excel, tipos y flows;
- efectos sobre ambos navegadores;
- exposición de información sensible;
- mantenimiento futuro y ausencia de duplicación;
- evidencia real de las verificaciones declaradas.
