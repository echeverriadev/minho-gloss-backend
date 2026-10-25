# Proposal

## Why

El autolavado ofrece servicios con un precio distinto según el medio de transporte (Ligeiro, SUV, Monovolume y Carrinha) y extras que se suman al servicio. El dueño necesita cargar y actualizar ese catálogo él mismo, y el catálogo es la fuente del precio de lista al registrar un servicio y la base para agrupar las métricas.

## What Changes

- CRUD del catálogo (`/api/tipos-servicio`): alta, edición y baja solo para `admin`; consulta para cualquier usuario autenticado.
- Cada entrada tiene título, descripción, categoría (`servicio` o `extra`) y precio: cuatro precios, uno por tipo de vehículo, o un precio único.
- Consulta del precio de lista de una entrada para un tipo de vehículo.
- Orden configurable dentro de cada categoría.
- Los tipos de vehículo pasan a ser `ligeiro`, `suv`, `monovolume` y `carrinha` (cambia `domain-model`).
- Comando `npm run seed:catalogo` que carga el catálogo actual del negocio si está vacío.

Fuera de alcance: combos o paquetes, promociones con fecha de vigencia, historial de precios (lo cubre la copia del precio en cada servicio prestado), duración estimada e impuestos.

## Capabilities

### New Capabilities
- `tipos-servicio`: catálogo de servicios y extras que ofrece el negocio y sus precios.

### Modified Capabilities
- `domain-model`: nuevos tipos de vehículo y nueva forma de la entidad `TipoServicio`.
- `product-scope`: el glosario define vehículo con los tipos del negocio y agrega "extra".

## Impact

- Código nuevo: `src/modules/tipos-servicio/` y `src/seeds/catalogo-inicial.ts`.
- `ROLES` tiene ahora un par: `TIPOS_VEHICULO` en `src/common/` para vehículos, catálogo y servicios prestados.
- Depende de `add-auth`. Lo usan `add-vehiculos`, `add-servicios-prestados` (precio de lista) y `add-metricas` (agrupación).
- El frontend (`add-catalogo-servicios-ui`) consume estos endpoints.
