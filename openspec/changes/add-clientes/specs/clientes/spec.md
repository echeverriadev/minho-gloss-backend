# Spec Delta

## Purpose
Registro y consulta de los clientes del autolavado, con búsqueda rápida por nombre, teléfono o placa y baja lógica que conserva su historial.

## ADDED Requirements

### Requirement: Alta de clientes
La API SHALL exponer `POST /api/clientes` para usuarios autenticados, con `{ nombre, telefono, email?, aceptaContacto, notas? }` validados según `domain-model`, y SHALL responder 201 con el cliente creado y el teléfono normalizado. El cuerpo MAY incluir `vehiculos: [{ placa, tipo, marca?, modelo?, color? }]` para crear el cliente y sus vehículos en una sola operación; si algún vehículo es inválido, no se SHALL crear nada.

#### Scenario: Cliente nuevo con su vehículo
- **WHEN** un empleado envía un cliente con un vehículo de placa `abc 123`
- **THEN** la API responde 201 con el cliente y un vehículo con placa `ABC123`

#### Scenario: Teléfono ya registrado
- **WHEN** se crea un cliente con un teléfono que ya usa otro cliente activo
- **THEN** la API responde 409 con el mensaje "El teléfono ya está registrado para <nombre del otro cliente>" y el `id` de ese cliente

### Requirement: Listado y búsqueda de clientes
La API SHALL exponer `GET /api/clientes` con paginación estándar, orden por defecto `nombre` ascendente y parámetro `q`. Con `q`, SHALL devolver los clientes cuyo nombre contenga una palabra que empiece por `q` (sin distinguir mayúsculas ni tildes), cuyo teléfono empiece por `q` normalizado, o que tengan un vehículo activo cuya placa empiece por `q` normalizado. Cada cliente del listado SHALL incluir las placas de sus vehículos activos.

#### Scenario: Buscar por parte de la placa
- **WHEN** se pide `GET /api/clientes?q=abc`
- **THEN** la respuesta incluye al cliente dueño del vehículo `ABC123`

#### Scenario: Buscar por nombre sin tilde
- **WHEN** se pide `GET /api/clientes?q=jose`
- **THEN** la respuesta incluye a "José Pérez"

### Requirement: Ficha del cliente
La API SHALL exponer `GET /api/clientes/:id`, que devuelve el cliente con sus vehículos activos, `ultimoServicioEn` y `totalServicios`. Un id inexistente o de un cliente inactivo SHALL responder 404, salvo para `admin` con `incluirInactivos=true`.

#### Scenario: Abrir la ficha
- **WHEN** se pide la ficha de un cliente con dos vehículos
- **THEN** la respuesta trae el cliente con sus dos vehículos y sus contadores

### Requirement: Edición de clientes
La API SHALL exponer `PATCH /api/clientes/:id` con cualquier subconjunto de `nombre`, `telefono`, `email`, `aceptaContacto` y `notas`, aplicando las mismas validaciones y normalizaciones del alta, y SHALL responder 200 con el cliente actualizado.

#### Scenario: Cliente retira su autorización de contacto
- **WHEN** se actualiza un cliente con `aceptaContacto: false`
- **THEN** el cliente deja de aparecer en las listas de post-venta a partir de ese momento

### Requirement: Baja de clientes
La API SHALL exponer `DELETE /api/clientes/:id`, exclusivo de `admin`, que da de baja al cliente y a todos sus vehículos (`activo: false`) y responde 204. Sus servicios prestados SHALL conservarse sin cambios.

#### Scenario: Empleado intenta dar de baja
- **WHEN** un empleado llama a `DELETE /api/clientes/:id`
- **THEN** la API responde 403

#### Scenario: Baja con historial
- **WHEN** el admin da de baja a un cliente con servicios prestados
- **THEN** el cliente y sus vehículos quedan inactivos y sus servicios siguen en las métricas
