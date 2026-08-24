# Reglas de suscripción y rechazo

## Objetivo

La decisión de una solicitud se modela en `ReglasSuscripcion` como una regla
independiente de la UI. Los flujos E2E pueden usarla para construir datos
dirigidos y para comprobar el resultado visible sin depender de selecciones
aleatorias.

La precedencia es:

1. Edad no asegurable: bloquea el registro antes de guardar o avanzar.
2. Diagnóstico crítico del titular: rechaza la solicitud completa.
3. Diagnóstico crítico de dependientes: excluye sólo a los dependientes,
   recalcula la prima y conserva su aparición en Declaración y POA.
4. Cualquier criterio de UW: dirige a `Nuevas`.
5. Solicitud sin criterios y no rechazada: dirige a `Pendientes`.

## Cobertura por historia

| HU | Entrada | Decisión automatizada |
|---|---|---|
| 1 | Edad exacta de cualquier asegurado | 77+ bloquea; 64–76 envía a UW y programa el correo de requerimientos después de información general. |
| 2 | Fecha de nacimiento, sexo, peso, estatura y unidades | Convierte lb→kg y ft→m; usa BMI adulto de 18–76, BMI pediátrico desde 24 meses hasta 17 años y percentil de crecimiento antes de 24 meses. |
| 3 | C, D, F, G, I, K, L o N con diagnóstico crítico | Titular: `Rechazadas`, sin Cybersource. Dependiente: exclusión individual, recálculo, correo y motivo por diagnóstico. |
| 4 | Diagnóstico no crítico en C/D/F/G/I/K/L/N o afirmativa en A/B/E/H/J/M/O/P/Q/R | `Nuevas`, estado localizado de UW y formularios médicos aplicables. |
| 5 | Información general o documento de cobertura previa | Una afirmativa distinta de PEP o un archivo dirige a `Nuevas`; PEP como única afirmativa dirige a `Pendientes`. |
| 6 | Resultado agregado | `Nuevas`, `Pendientes` o `Rechazadas`; conserva identificador, origen y fecha de actualización. |

Los estados localizados cubiertos son:

| Resultado | Esp | Eng | Port |
|---|---|---|---|
| UW | En Suscripción | In Underwriting | Em Subscrição |
| Rechazo total | Declaración rechazada | Rejected Declaration | Declaração rejeitada |

## Datos antropométricos de prueba

Los recorridos que no tienen BMI como objetivo usan perfiles sintéticos
deterministas por edad. El titular y cónyuge normales usan 35 años, 170 cm y
65 kg. Los hijos normales usan 10 años, 135 cm y 32 kg. Ya no se generan
recién nacidos con medidas de adulto ni cónyuges aleatorios dentro del rango
de edad avanzada.

El perfil dirigido a evaluación BMI conserva 180 cm y 180 kg. Peso, estatura
y fecha de nacimiento se fijan como una unidad coherente; ninguno se genera
aisladamente.

## Matriz automatizada

Los cinco specs de `src/tests/reglas/` contienen 83 casos y cubren:

- fronteras de 24 meses, 18, 64, 76 y 77 años;
- fórmula y conversiones de BMI;
- los 17 diagnósticos críticos, tanto en titular como en dependiente;
- diagnósticos no críticos de C/D/F/G/I/K/L/N;
- todas las preguntas de UW sin excepción;
- los cuatro formularios médicos y variantes cardiovasculares;
- información general, PEP, archivo previo, solicitud limpia y precedencia;
- estados localizados y trazabilidad.

Ejecución focalizada:

```bash
npm run test:reglas
```

Esta suite no inicia un navegador ni recorre la aplicación: valida el árbol de
decisiones en memoria. Para ejecutar un recorrido funcional real de BMI con
navegador:

```bash
npm run test:flujo:bmi
```

## Datos funcionales aún requeridos

Las HU recibidas no incluyen los límites de aceptación BMI para adultos, las
tablas percentiles por edad/sexo del cliente ni los textos localizados del
bloqueo de 77 años. Por ello:

- la utilidad calcula el BMI y selecciona el método correcto;
- el resultado `DentroRango`/`FueraRango` se recibe de la tabla de negocio;
- para menores de 24 meses se registra si aún hace falta consultar la tabla;
- no se inventan mensajes ni umbrales clínicos ausentes.

Cuando se proporcionen esos catálogos se deberán conectar al resultado de
rango y agregar aserciones exactas de mensajes/correos sin cambiar la
precedencia de decisiones.
