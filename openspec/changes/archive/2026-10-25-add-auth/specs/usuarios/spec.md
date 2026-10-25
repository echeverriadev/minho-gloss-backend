# Spec Delta

## Purpose
Gestión de las cuentas de los usuarios del negocio (dueño y empleados) por parte del administrador.

## ADDED Requirements

### Requirement: Listado de usuarios
La API SHALL exponer `GET /api/usuarios`, exclusivo de `admin`, con paginación estándar y filtro opcional `incluirInactivos`. Cada usuario SHALL devolverse con `id`, `nombre`, `email`, `rol`, `activo`, `createdAt` y `updatedAt`, nunca con la contraseña ni su hash.

#### Scenario: Admin lista usuarios
- **WHEN** el admin pide `GET /api/usuarios`
- **THEN** recibe los usuarios activos paginados y sin datos de contraseña

### Requirement: Alta de usuarios
La API SHALL exponer `POST /api/usuarios`, exclusivo de `admin`, con `{ nombre, email, password, rol }` validados según `domain-model`, y SHALL responder 201 con el usuario creado. Un correo ya registrado SHALL responder 409.

#### Scenario: Crear un empleado
- **WHEN** el admin crea un usuario con rol `empleado`
- **THEN** la API responde 201 y ese empleado puede iniciar sesión

#### Scenario: Correo repetido
- **WHEN** el admin crea un usuario con un correo que ya existe, aunque cambien mayúsculas
- **THEN** la API responde 409 con el mensaje "Ya existe un usuario con ese correo"

### Requirement: Edición y baja de usuarios
La API SHALL exponer `PATCH /api/usuarios/:id` (nombre, rol, activo) y `DELETE /api/usuarios/:id` (baja lógica), ambos exclusivos de `admin`. SHALL rechazar con 409 cualquier operación que deje al sistema sin un admin activo, y un admin SHALL NOT poder desactivarse a sí mismo.

#### Scenario: Desactivar al último admin
- **WHEN** el único admin activo intenta cambiar su rol a `empleado`
- **THEN** la API responde 409 con el mensaje "Debe quedar al menos un administrador activo"

#### Scenario: Desactivar a un empleado
- **WHEN** el admin hace `DELETE /api/usuarios/:id` de un empleado
- **THEN** la API responde 204 y el empleado queda con `activo: false`

### Requirement: Restablecer contraseña
La API SHALL exponer `POST /api/usuarios/:id/restablecer-password`, exclusivo de `admin`, con `{ "password": string }` de al menos 8 caracteres, que reemplaza la contraseña del usuario y responde 204.

#### Scenario: Empleado olvidó su contraseña
- **WHEN** el admin restablece la contraseña de un empleado
- **THEN** el empleado puede iniciar sesión solo con la contraseña nueva
