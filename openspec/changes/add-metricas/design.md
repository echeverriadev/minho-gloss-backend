# Design

## Context

Se esperan decenas de servicios por día, es decir, unos pocos miles por mes. Las consultas las hace solo el admin, unas pocas veces al día.

## Goals / Non-Goals

**Goals:**
- Cálculo correcto por día en la zona horaria del negocio.
- Respuestas en menos de un segundo con el plan gratuito de Atlas.

**Non-Goals:**
- Precalcular o cachear métricas.

## Decisions

1. **Agregaciones en el momento** (`$match` por rango y estado, `$group`), sin colecciones de métricas precalculadas. Con este volumen es suficiente y evita inconsistencias. Alternativa: tabla diaria precalculada por un job; se reconsidera si las consultas superan un segundo.
2. **Agrupación por día con `$dateToString` y `timezone: APP_TIMEZONE`**, para que el corte del día sea a medianoche de Portugal. La serie diaria completa con ceros los días sin servicios.
3. **Cliente nuevo** en un rango = su primer servicio completado de la historia cae dentro del rango. **Recurrente** = fue atendido en el rango y tiene al menos un servicio completado anterior al inicio del rango. Así, nuevos + recurrentes = clientes atendidos.
4. **Periodo anterior** = rango de la misma cantidad de días que termina el día antes de `desde`. Se devuelve la variación porcentual de ingresos y de cantidad; si el periodo anterior es 0, la variación es `null`.
5. **Rango máximo de 366 días** para acotar el costo de la consulta.
6. **Ticket promedio** = ingresos / cantidad, redondeado al entero más cercano; 0 si no hay servicios.

## Risks / Trade-offs

- [Consultas más lentas si el volumen crece mucho] → índices en `realizadoEn` y `estado` (de `add-servicios-prestados`) y la alternativa precalculada documentada arriba.
