# Spec Delta

## Purpose
Registro de cada servicio realizado a un vehículo, con el precio cobrado y el método de pago, que alimenta las métricas, el historial del cliente y la post-venta.

## ADDED Requirements

### Requirement: Registrar un servicio prestado
La API SHALL exponer `POST /api/servicios-prestados` para usuarios autenticados, con `{ vehiculoId, tipoServicioId, precioCobrado?, metodoPago, realizadoEn?, notas? }`. La API SHALL tomar el `clienteId` del vehículo, copiar `tipoServicioNombre` y calcular `precioLista` según el tipo de vehículo, usar `precioLista` cuando no se envíe `precioCobrado`, usar el momento actual cuando no se envíe `realizadoEn`, asignar `registradoPor` con el usuario de la sesión y responder 201 con el servicio creado.

#### Scenario: Registro con valores por defecto
- **WHEN** un empleado registra "EXPRESS GLOSS" (precio de SUV 2000) para un SUV, pagado en efectivo, sin precio ni fecha
- **THEN** se crea un servicio con `precioLista` y `precioCobrado` 2000, `realizadoEn` el momento actual y `registradoPor` el empleado

#### Scenario: Tipo de servicio inactivo
- **WHEN** se intenta registrar un servicio con un tipo dado de baja
- **THEN** la API responde 409 con el mensaje "El tipo de servicio no está disponible"

#### Scenario: Fecha en el futuro
- **WHEN** se envía `realizadoEn` posterior al momento actual
- **THEN** la API responde 400 con el mensaje "La fecha del servicio no puede estar en el futuro"

### Requirement: Registro con fecha pasada
Un `empleado` SHALL poder registrar servicios con `realizadoEn` solo dentro del día actual en la zona horaria del negocio. Un `admin` SHALL poder registrar servicios de días anteriores para corregir olvidos.

#### Scenario: Empleado registra un servicio de ayer
- **WHEN** un empleado envía `realizadoEn` del día anterior
- **THEN** la API responde 403 con el mensaje "Solo un administrador puede registrar servicios de días anteriores"

### Requirement: Listado de servicios prestados
La API SHALL exponer `GET /api/servicios-prestados` con paginación estándar, orden por defecto `-realizadoEn` y filtros `desde`, `hasta` (días en la zona del negocio), `clienteId`, `vehiculoId`, `tipoServicioId`, `metodoPago` y `estado` (por defecto `completado`). La respuesta SHALL incluir, además de la paginación, `resumen: { cantidad, totalCobrado }` calculado sobre todo el filtro y no solo sobre la página. Cada ítem SHALL incluir el nombre del cliente y la placa del vehículo.

#### Scenario: Servicios del día
- **WHEN** se pide `GET /api/servicios-prestados?desde=2026-10-18&hasta=2026-10-18`
- **THEN** se devuelven los servicios completados de ese día con el nombre del cliente, la placa y el resumen del día

#### Scenario: Historial de un cliente
- **WHEN** se pide `GET /api/servicios-prestados?clienteId=<id>`
- **THEN** se devuelven todos los servicios completados de ese cliente, del más reciente al más antiguo

### Requirement: Edición limitada
La API SHALL exponer `PATCH /api/servicios-prestados/:id` que solo permite cambiar `metodoPago` y `notas`. Un `empleado` SHALL poder editar solo servicios del día actual; un `admin`, cualquiera. Un servicio anulado SHALL NOT poder editarse. Para corregir el tipo, el vehículo o el precio, el servicio SHALL anularse y registrarse de nuevo.

#### Scenario: Corregir el método de pago
- **WHEN** un empleado cambia el método de pago de un servicio de hoy a `transferencia`
- **THEN** la API responde 200 con el servicio actualizado

### Requirement: Anulación
La API SHALL exponer `POST /api/servicios-prestados/:id/anular`, exclusivo de `admin`, con `{ "motivo": string }` (obligatorio, 3 a 200 caracteres), que cambia el estado a `anulado`, guarda `anulacion: { motivo, anuladoPor, anuladoEn }` y responde 200. Anular un servicio ya anulado SHALL responder 409.

#### Scenario: Servicio registrado por error
- **WHEN** el admin anula un servicio con motivo "Registrado dos veces"
- **THEN** el servicio queda `anulado` y deja de contar en métricas y en el resumen del listado

### Requirement: Contadores del cliente
Registrar o anular un servicio SHALL recalcular `ultimoServicioEn` (fecha del último servicio completado) y `totalServicios` (cantidad de servicios completados) del cliente.

#### Scenario: Anular el último servicio del cliente
- **WHEN** se anula el servicio más reciente de un cliente
- **THEN** su `ultimoServicioEn` pasa a la fecha de su servicio completado anterior, o queda vacío si no tiene otro
