# Proposal

## Why

El autolavado ofrece varios tipos de servicio con precios distintos, y a menudo el precio cambia según el tamaño del vehículo. El catálogo es la fuente del precio de lista al registrar un servicio y la base para agrupar las métricas por tipo.

## What Changes

- CRUD de tipos de servicio (`/api/tipos-servicio`), con alta, edición y baja solo para `admin` y consulta para cualquier usuario autenticado.
- Precio base y precios opcionales por tipo de vehículo.
- Consulta del precio de lista de un tipo de servicio para un tipo de vehículo.
- Orden configurable para mostrar primero los servicios más usados.

Fuera de alcance: combos o paquetes de servicios, promociones con fecha de vigencia, historial de precios (lo cubre la copia del precio en cada servicio prestado) e impuestos.

## Capabilities

### New Capabilities
- `tipos-servicio`: catálogo de los servicios que ofrece el negocio y sus precios.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/tipos-servicio/`.
- Depende de `add-auth`. Lo usan `add-servicios-prestados` (precio de lista) y `add-metricas` (agrupación).
- El frontend (`add-catalogo-servicios-ui`) consume estos endpoints.
