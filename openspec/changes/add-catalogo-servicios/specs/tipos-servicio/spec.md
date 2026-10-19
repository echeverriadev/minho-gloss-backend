# Spec Delta

## Purpose
Catálogo de los tipos de servicio que ofrece el autolavado, con su precio base y precios por tipo de vehículo, usado al registrar servicios y en las métricas.

## ADDED Requirements

### Requirement: Consulta del catálogo
La API SHALL exponer `GET /api/tipos-servicio` para cualquier usuario autenticado, que devuelve todos los tipos activos (sin paginar, ordenados por `orden` y luego por `nombre`) con `id`, `nombre`, `descripcion`, `precioBase`, `preciosPorVehiculo`, `duracionMinutos`, `orden` y `activo`. El `admin` MAY pedir `incluirInactivos=true`.

#### Scenario: Empleado consulta el catálogo
- **WHEN** un empleado pide `GET /api/tipos-servicio`
- **THEN** recibe los tipos activos en el orden definido por el admin

### Requirement: Gestión del catálogo
La API SHALL exponer `POST /api/tipos-servicio`, `PATCH /api/tipos-servicio/:id` y `DELETE /api/tipos-servicio/:id` (baja lógica), exclusivos de `admin`, con los campos y reglas de `TipoServicio` en `domain-model` más `orden` (entero, por defecto 0). `preciosPorVehiculo` SHALL aceptar solo las claves `auto`, `camioneta`, `moto` y `otro`, con valores enteros mayores o iguales a 0. Un nombre repetido entre tipos activos SHALL responder 409.

#### Scenario: Crear un servicio con precio por vehículo
- **WHEN** el admin crea "Lavado completo" con `precioBase` 2500 y `preciosPorVehiculo: { "camioneta": 3200 }`
- **THEN** la API responde 201 con el tipo creado

#### Scenario: Clave de vehículo inválida
- **WHEN** el admin envía `preciosPorVehiculo: { "bus": 4000 }`
- **THEN** la API responde 400 indicando que `bus` no es un tipo de vehículo válido

#### Scenario: Empleado intenta cambiar un precio
- **WHEN** un empleado llama a `PATCH /api/tipos-servicio/:id`
- **THEN** la API responde 403

### Requirement: Precio de lista
La API SHALL exponer `GET /api/tipos-servicio/:id/precio?tipoVehiculo=<tipo>`, que responde `{ "precio": <entero> }` con el precio de `preciosPorVehiculo[tipoVehiculo]` si existe, o `precioBase` si no. El mismo cálculo SHALL usarse al registrar un servicio prestado.

#### Scenario: Vehículo sin precio específico
- **WHEN** se pide el precio de "Lavado completo" para una moto y no tiene precio de moto
- **THEN** la respuesta es `{ "precio": 2500 }`

### Requirement: Baja sin afectar el historial
Dar de baja un tipo de servicio SHALL impedir registrar servicios nuevos con él, pero SHALL NOT modificar los servicios prestados que ya lo usan ni quitarlo de las métricas de fechas pasadas.

#### Scenario: Servicio retirado del catálogo
- **WHEN** el admin da de baja "Encerado premium"
- **THEN** ya no aparece al registrar servicios
- **AND** las métricas del mes pasado siguen mostrando sus ingresos
