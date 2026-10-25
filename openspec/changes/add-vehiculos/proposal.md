# Proposal

## Why

Los servicios del autolavado se prestan a un vehículo, y la forma más rápida de identificar a un cliente en el patio es la placa. Este cambio se separó de `add-clientes` en la fase 2 para entregar primero la gestión de los datos personales del cliente que pidió el dueño; los vehículos se implementan antes que los servicios prestados, que los necesitan.

## What Changes

- CRUD de vehículos asociados a un cliente (`/api/vehiculos` y `/api/clientes/:id/vehiculos`).
- Búsqueda exacta de un vehículo por placa para el registro rápido de servicios.
- Normalización de placas a mayúsculas sin separadores, con unicidad entre registros activos.
- La búsqueda `q` de clientes incluye las placas de sus vehículos activos y el listado de clientes muestra sus placas.
- La baja y la anonimización de un cliente dan de baja también a sus vehículos.

Fuera de alcance: fotos de vehículos, historial de dueños más allá del `clienteId` actual y lectura automática de placas.

## Capabilities

### New Capabilities
- `vehiculos`: vehículos de cada cliente identificados por placa.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/vehiculos/` y `normalizarPlaca` en `src/common/normalizacion/`.
- Índices de MongoDB: único parcial (solo activos) en `placa` e índice en `clienteId`.
- Depende de `add-clientes`. Lo usa `add-servicios-prestados`.
- El frontend (`add-vehiculos-ui`) consume estos endpoints.
