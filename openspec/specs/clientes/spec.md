# clientes Specification

## Purpose
Registro y consulta de los clientes del autolavado, con búsqueda rápida por nombre, apellido, cédula o teléfono y baja lógica que conserva su historial.

## Requirements

### Requirement: Alta de clientes
La API SHALL exponer `POST /api/clientes` para usuarios autenticados, con `{ nombre, apellido, cedula, telefono, email, direccion, fechaNacimiento, aceptaContacto, notas? }` validados según `domain-model`, y SHALL responder 201 con el cliente creado, el teléfono y la cédula normalizados.

#### Scenario: Cliente nuevo
- **WHEN** un empleado envía un cliente con teléfono `912 345 678` y cédula `12345678 9 zz4`
- **THEN** la API responde 201 con `telefono: "+351912345678"` y `cedula: "123456789ZZ4"`

#### Scenario: Teléfono ya registrado
- **WHEN** se crea un cliente con un teléfono que ya usa otro cliente activo
- **THEN** la API responde 409 con el mensaje "El teléfono ya está registrado para <nombre y apellido del otro cliente>", `campo: "telefono"` y `clienteId` con el `id` de ese cliente

#### Scenario: Cédula ya registrada
- **WHEN** se crea un cliente con una cédula que ya usa otro cliente activo, aunque se escriba con espacios o minúsculas
- **THEN** la API responde 409 con el mensaje "La cédula ya está registrada para <nombre y apellido del otro cliente>", `campo: "cedula"` y `clienteId`

#### Scenario: Fecha de nacimiento futura
- **WHEN** se envía una `fechaNacimiento` posterior a hoy
- **THEN** la API responde 400 con el mensaje "La fecha de nacimiento no puede ser futura"

### Requirement: Listado y búsqueda de clientes
La API SHALL exponer `GET /api/clientes` con paginación estándar, orden por defecto `apellido` y luego `nombre` ascendentes, y parámetro `q`. Con `q`, SHALL devolver los clientes cuyo nombre o apellido contenga una palabra que empiece por `q` (sin distinguir mayúsculas ni tildes), cuya cédula empiece por `q` normalizado como cédula o cuyo teléfono contenga los dígitos de `q` (al menos 3). El `admin` MAY pedir `incluirInactivos=true`.

#### Scenario: Buscar por nombre sin tilde
- **WHEN** se pide `GET /api/clientes?q=jose`
- **THEN** la respuesta incluye a "José Pérez"

#### Scenario: Buscar por parte del teléfono
- **WHEN** se pide `GET /api/clientes?q=912 34`
- **THEN** la respuesta incluye al cliente con teléfono `+351912345678`

#### Scenario: Buscar por cédula
- **WHEN** se pide `GET /api/clientes?q=123456`
- **THEN** la respuesta incluye al cliente con cédula `123456789ZZ4`

### Requirement: Ficha del cliente
La API SHALL exponer `GET /api/clientes/:id`, que devuelve el cliente con todos sus campos, `ultimoServicioEn` y `totalServicios`. Un id inexistente o de un cliente inactivo SHALL responder 404 con el mensaje "Cliente no encontrado", salvo para `admin` con `incluirInactivos=true`.

#### Scenario: Abrir la ficha
- **WHEN** se pide la ficha de un cliente activo
- **THEN** la respuesta trae sus datos personales y sus contadores

### Requirement: Edición de clientes
La API SHALL exponer `PATCH /api/clientes/:id` con cualquier subconjunto de los campos del alta, aplicando las mismas validaciones, normalizaciones y reglas de duplicados, y SHALL responder 200 con el cliente actualizado.

#### Scenario: Cliente retira su autorización de contacto
- **WHEN** se actualiza un cliente con `aceptaContacto: false`
- **THEN** el cliente deja de aparecer en las listas de post-venta a partir de ese momento

#### Scenario: Cambiar el teléfono por uno de otro cliente
- **WHEN** se actualiza el teléfono con uno que usa otro cliente activo
- **THEN** la API responde 409 y el cliente no cambia

### Requirement: Baja de clientes
La API SHALL exponer `DELETE /api/clientes/:id`, exclusivo de `admin`, que da de baja al cliente (`activo: false`) y responde 204. Sus servicios prestados SHALL conservarse sin cambios.

#### Scenario: Empleado intenta dar de baja
- **WHEN** un empleado llama a `DELETE /api/clientes/:id`
- **THEN** la API responde 403

#### Scenario: Baja con historial
- **WHEN** el admin da de baja a un cliente con servicios prestados
- **THEN** el cliente queda inactivo, deja de aparecer en el listado y sus servicios siguen en las métricas

### Requirement: Anonimización de un cliente
La API SHALL exponer `POST /api/clientes/:id/anonimizar`, exclusivo de `admin`, que aplica el derecho de supresión de `domain-model` (RGPD) y responde 204. Un cliente ya anonimizado SHALL responder 409 con el mensaje "El cliente ya fue anonimizado".

#### Scenario: Supresión a pedido del cliente
- **WHEN** el admin anonimiza a un cliente
- **THEN** `GET /api/clientes?q=<nombre anterior>` ya no lo devuelve y su ficha no muestra datos personales
