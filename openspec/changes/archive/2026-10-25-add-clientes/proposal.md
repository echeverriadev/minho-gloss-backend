# Proposal

## Why

El objetivo principal del proyecto es guardar a todos los clientes del autolavado. Sin clientes no se pueden registrar servicios, calcular métricas ni hacer post-venta. En la fase 2 el dueño pidió conocer de cada cliente su nombre, apellido, cédula, teléfono celular, correo, dirección y fecha de nacimiento, y poder buscarlos rápido desde el celular.

## What Changes

- CRUD de clientes con baja lógica (`/api/clientes`) con los campos `nombre`, `apellido`, `cedula`, `telefono`, `email`, `direccion` y `fechaNacimiento`, además de `aceptaContacto` (RGPD) y `notas`.
- Búsqueda de clientes por nombre, apellido, cédula o teléfono con un solo campo `q`.
- Normalización del teléfono a E.164 (`+351` por defecto) y de la cédula a mayúsculas sin separadores, ambos únicos entre clientes activos.
- Anonimización irreversible de un cliente a pedido suyo (derecho de supresión del RGPD).
- Campos calculados `ultimoServicioEn` y `totalServicios` en el cliente (los mantiene `add-servicios-prestados`).
- Se modifica la entidad `Cliente` de `domain-model` con los campos nuevos.

Fuera de alcance: vehículos (pasan al cambio `add-vehiculos`), importar clientes desde Excel/CSV, fusionar clientes duplicados y historial de cambios de cada campo.

## Capabilities

### New Capabilities
- `clientes`: alta, consulta, búsqueda, edición, baja y anonimización de los clientes del autolavado.

### Modified Capabilities
- `domain-model`: la entidad `Cliente` agrega `apellido`, `cedula`, `direccion` y `fechaNacimiento`, y el correo pasa a ser obligatorio.

## Impact

- Código nuevo: `src/modules/clientes/`; utilidades de normalización de teléfono y cédula en `src/common/normalizacion/`; paginación y `ParseObjectIdPipe` en `src/common/`.
- Variable de entorno nueva: `DEFAULT_COUNTRY_CODE` (por defecto `351`).
- Índices de MongoDB: únicos parciales (solo activos) en `telefono` y `cedula`.
- Depende de `add-auth` (todos los endpoints requieren sesión).
- El frontend (`add-clientes-ui`) consume estos endpoints.
