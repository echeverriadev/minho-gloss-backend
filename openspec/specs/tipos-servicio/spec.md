# tipos-servicio Specification

## Purpose
Catálogo de los servicios y extras que ofrece el autolavado, con su precio por tipo de vehículo o precio único, usado al registrar servicios y en las métricas.

## Requirements

### Requirement: Consulta del catálogo
La API SHALL exponer `GET /api/tipos-servicio` para cualquier usuario autenticado, que devuelve las entradas activas sin paginar, primero los servicios y luego los extras, cada grupo ordenado por `orden` y luego por `nombre`. Cada entrada SHALL incluir `id`, `nombre`, `descripcion`, `categoria`, `modoPrecio`, `precios`, `precioUnico`, `orden` y `activo`. SHALL aceptar el filtro `categoria` y, solo para `admin`, `incluirInactivos=true`.

#### Scenario: Empleado consulta el catálogo
- **WHEN** un empleado pide `GET /api/tipos-servicio`
- **THEN** recibe los servicios activos y después los extras activos, en el orden definido por el admin

#### Scenario: Solo extras
- **WHEN** se pide `GET /api/tipos-servicio?categoria=extra`
- **THEN** la respuesta contiene solo los extras

### Requirement: Gestión del catálogo
La API SHALL exponer `POST /api/tipos-servicio`, `PATCH /api/tipos-servicio/:id` y `DELETE /api/tipos-servicio/:id` (baja lógica), exclusivos de `admin`, con los campos y reglas de `TipoServicio` en `domain-model`. Con `modoPrecio: "por-vehiculo"` SHALL exigir los cuatro precios; con `modoPrecio: "unico"` SHALL exigir `precioUnico`. Un nombre repetido entre entradas activas, sin distinguir mayúsculas, SHALL responder 409 con el mensaje "Ya existe un servicio llamado <nombre>".

#### Scenario: Crear un servicio con precio por vehículo
- **WHEN** el admin crea "EXPRESS GLOSS" con `precios` 1700, 2000, 2500 y 3000
- **THEN** la API responde 201 con la entrada creada

#### Scenario: Faltan precios
- **WHEN** el admin crea un servicio `por-vehiculo` sin el precio de Carrinha
- **THEN** la API responde 400 con el mensaje "Falta el precio para Carrinha"

#### Scenario: Crear un extra de precio único
- **WHEN** el admin crea el extra "Higienização com ozono" con `precioUnico` 1000
- **THEN** la API responde 201 y su precio es el mismo para cualquier vehículo

#### Scenario: Empleado intenta cambiar un precio
- **WHEN** un empleado llama a `PATCH /api/tipos-servicio/:id`
- **THEN** la API responde 403

### Requirement: Precio de lista
La API SHALL exponer `GET /api/tipos-servicio/:id/precio?tipoVehiculo=<tipo>`, que responde `{ "precio": <entero> }`: `precioUnico` si el modo es `unico`, o `precios[tipoVehiculo]` si es `por-vehiculo`. Un `tipoVehiculo` que no sea `ligeiro`, `suv`, `monovolume` o `carrinha` SHALL responder 400. El mismo cálculo SHALL usarse al registrar un servicio prestado.

#### Scenario: Precio para un SUV
- **WHEN** se pide el precio de "FULL GLOSS" para un `suv`
- **THEN** la respuesta es `{ "precio": 3000 }`

### Requirement: Baja sin afectar el historial
Dar de baja una entrada del catálogo SHALL impedir registrar servicios nuevos con ella, pero SHALL NOT modificar los servicios prestados que ya la usan ni quitarla de las métricas de fechas pasadas. Su nombre SHALL quedar libre para una entrada nueva.

#### Scenario: Servicio retirado del catálogo
- **WHEN** el admin da de baja "PREMIUM GLOSS"
- **THEN** ya no aparece al registrar servicios
- **AND** las métricas del mes pasado siguen mostrando sus ingresos

### Requirement: Carga inicial del catálogo
El comando `npm run seed:catalogo` SHALL cargar el catálogo actual del negocio (servicios ASPIRAÇÃO, EXPRESS GLOSS, FULL GLOSS, PREMIUM GLOSS y EXTERIOR GLOSS, y los extras Lavagem de estofos, Polimento de faróis, Lavagem do motor, Remoção de pelos de animais e Higienização com ozono) solo si el catálogo no tiene ninguna entrada.

#### Scenario: Catálogo ya cargado
- **WHEN** se ejecuta `npm run seed:catalogo` y ya hay entradas
- **THEN** no se crea ni modifica nada
