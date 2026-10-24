# Proposal

## Why

El dueño quiere saber, cada día y en periodos más largos, cuánto factura, qué servicios se venden más y si sus clientes vuelven. Hoy esa información no existe en ningún lado; con los servicios prestados registrados se puede calcular sin costo extra.

## What Changes

- Resumen de un rango de fechas (`GET /api/metricas/resumen`): ingresos, cantidad de servicios, ticket promedio, desglose por tipo de servicio, por método de pago y por tipo de vehículo, clientes atendidos, nuevos y recurrentes, y comparación con el periodo anterior.
- Serie diaria (`GET /api/metricas/serie-diaria`) para graficar ingresos y cantidad por día.
- Clientes inactivos (`GET /api/metricas/clientes-inactivos`) que no vuelven hace más de N días.
- Todas las métricas son exclusivas del rol `admin` y excluyen los servicios anulados.

Fuera de alcance: métricas por empleado, metas o presupuestos, exportar a Excel/PDF, proyecciones y métricas en tiempo real por WebSocket.

## Capabilities

### New Capabilities
- `metricas`: indicadores de los servicios prestados por día y por rango de fechas.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/metricas/` (solo lectura, sin colecciones propias).
- Usa el modelo de servicios prestados y de clientes mediante agregaciones de MongoDB.
- Depende de `add-servicios-prestados`. El frontend (`add-metricas-ui`) consume estos endpoints.
