# Spec Delta

## Purpose
Vehículos de los clientes del autolavado, identificados por su placa, para registrar los servicios prestados a cada uno.

## ADDED Requirements

### Requirement: Agregar vehículos a un cliente
La API SHALL exponer `POST /api/clientes/:id/vehiculos` con `{ placa, tipo, marca?, modelo?, color? }`, que crea un vehículo activo para ese cliente con la placa normalizada y responde 201. Una placa ya usada por otro vehículo activo SHALL responder 409 con el nombre e `id` del cliente actual.

#### Scenario: Segundo vehículo del cliente
- **WHEN** se agrega una carrinha a un cliente que ya tiene un ligeiro
- **THEN** el cliente queda con dos vehículos activos

#### Scenario: Placa de otro cliente
- **WHEN** se agrega la placa `AA12BB` que ya pertenece a otro cliente activo
- **THEN** la API responde 409 con el mensaje "La placa AA12BB ya está registrada para <nombre>"

### Requirement: Buscar vehículo por placa
La API SHALL exponer `GET /api/vehiculos/por-placa/:placa`, que normaliza la placa y devuelve el vehículo activo con su cliente (`id`, `nombre`, `telefono`), o 404 si no existe.

#### Scenario: Placa conocida escrita con guion
- **WHEN** se pide `GET /api/vehiculos/por-placa/aa-12-bb`
- **THEN** la API devuelve el vehículo `AA12BB` con los datos de su cliente

#### Scenario: Placa desconocida
- **WHEN** se pide una placa que no está registrada
- **THEN** la API responde 404 con el mensaje "No hay un vehículo con la placa <placa>"

### Requirement: Edición y baja de vehículos
La API SHALL exponer `PATCH /api/vehiculos/:id` (placa, tipo, marca, modelo, color, `clienteId` para traspasarlo a otro cliente activo) y `DELETE /api/vehiculos/:id` (baja lógica, 204). Los servicios prestados del vehículo SHALL conservarse sin cambios.

#### Scenario: Vehículo vendido a otro cliente
- **WHEN** se actualiza un vehículo con el `clienteId` de otro cliente activo
- **THEN** los servicios nuevos se registran al nuevo cliente y los anteriores quedan con el cliente original
