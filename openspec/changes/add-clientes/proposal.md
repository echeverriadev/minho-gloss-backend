# Proposal

## Why

El objetivo principal del proyecto es guardar a todos los clientes del autolavado. Sin clientes y vehículos no se pueden registrar servicios, calcular métricas ni hacer post-venta, y la búsqueda rápida por placa o teléfono es lo que hace usable la app en el patio.

## What Changes

- CRUD de clientes con baja lógica (`/api/clientes`).
- CRUD de vehículos asociados a un cliente (`/api/vehiculos` y `/api/clientes/:id/vehiculos`).
- Búsqueda de clientes por nombre, teléfono o placa con un solo campo `q`.
- Búsqueda exacta de un vehículo por placa para el registro rápido de servicios.
- Normalización de teléfonos a E.164 y de placas a mayúsculas sin separadores, con unicidad entre registros activos.
- Anonimización irreversible de un cliente a pedido suyo (derecho de supresión del RGPD).
- Campos calculados `ultimoServicioEn` y `totalServicios` en el cliente (los mantiene `add-servicios-prestados`).

Fuera de alcance: importar clientes desde Excel/CSV, fusionar clientes duplicados, fotos de vehículos y historial de cambios de cada campo.

## Capabilities

### New Capabilities
- `clientes`: alta, consulta, búsqueda, edición y baja de los clientes del autolavado.
- `vehiculos`: vehículos de cada cliente identificados por placa.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/clientes/` y `src/modules/vehiculos/`; utilidades de normalización de teléfono y placa en `src/common/`.
- Variable de entorno nueva: `DEFAULT_COUNTRY_CODE` (por defecto `351`).
- Índices de MongoDB: texto o prefijo en `nombre`, únicos parciales (solo activos) en `telefono` y `placa`.
- Depende de `add-auth` (todos los endpoints requieren sesión).
- El frontend (`add-clientes-ui`) consume estos endpoints.
