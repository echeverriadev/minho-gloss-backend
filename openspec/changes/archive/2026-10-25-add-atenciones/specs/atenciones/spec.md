# Spec Delta

## Purpose
Registro de la operación diaria del autolavado: cada atención con sus servicios prestados, lo cobrado y el método de pago, que alimenta las métricas, el historial del cliente y el detalle imprimible.

## ADDED Requirements

### Requirement: Registrar una atención
La API SHALL exponer `POST /api/atenciones` para usuarios autenticados, con `{ clienteId?, tipoVehiculo, placa?, items: [{ tipoServicioId?, nombre?, precio? }], metodoPago, realizadoEn?, notas? }`. Por cada ítem con `tipoServicioId`, la API SHALL copiar `nombre` y `categoria` del catálogo y calcular `precioLista` para `tipoVehiculo`, y usar `precioLista` cuando no se envíe `precio`. La API SHALL calcular `total`, asignar el siguiente `numero`, usar el momento actual cuando no se envíe `realizadoEn`, asignar `registradoPor` con el usuario de la sesión y responder 201 con la atención creada.

#### Scenario: Atención con servicio y extra a precio de lista
- **WHEN** un empleado registra para un SUV "EXPRESS GLOSS" (SUV 2000) y el extra "Higienização com ozono" (único 1500), pagado en efectivo, sin precios ni fecha
- **THEN** se crea una atención con dos ítems, `total` 3500, `realizadoEn` el momento actual y `registradoPor` el empleado

#### Scenario: Tipo de servicio inactivo
- **WHEN** se intenta registrar un ítem con un tipo de servicio dado de baja
- **THEN** la API responde 409 con el mensaje "El servicio <nombre> ya no está disponible"

#### Scenario: Cliente dado de baja
- **WHEN** se envía el `clienteId` de un cliente inactivo o inexistente
- **THEN** la API responde 404 con el mensaje "Cliente no encontrado"

#### Scenario: Fecha en el futuro
- **WHEN** se envía `realizadoEn` posterior al momento actual
- **THEN** la API responde 400 con el mensaje "La fecha de la atención no puede estar en el futuro"

### Requirement: Precios personalizados
Un `admin` SHALL poder enviar en un ítem del catálogo un `precio` distinto del de lista, y SHALL poder enviar ítems sin `tipoServicioId`, con `nombre` (2 a 60 caracteres) y `precio` obligatorios, que se guardan con categoría `personalizado` y sin `precioLista`. Un `empleado` que envíe un precio distinto del de lista o un ítem personalizado SHALL recibir 403 con el mensaje "Solo un administrador puede cambiar precios o agregar servicios personalizados". Ninguna personalización SHALL modificar el catálogo.

#### Scenario: Descuento del admin
- **WHEN** el admin registra "FULL GLOSS" (lista 2500) con `precio` 2000
- **THEN** el ítem guarda `precioLista` 2500 y `precio` 2000, y el catálogo sigue en 2500

#### Scenario: Servicio fuera del catálogo
- **WHEN** el admin agrega el ítem `{ nombre: "Limpieza de llantas", precio: 800 }`
- **THEN** el ítem queda con categoría `personalizado`, `precioLista` vacío y suma 800 al total

#### Scenario: Empleado intenta un descuento
- **WHEN** un empleado envía un ítem del catálogo con un precio menor al de lista
- **THEN** la API responde 403 y no registra la atención

### Requirement: Registro con fecha pasada
Un `empleado` SHALL poder registrar atenciones con `realizadoEn` solo dentro del día actual en la zona horaria del negocio. Un `admin` SHALL poder registrar atenciones de días anteriores para corregir olvidos.

#### Scenario: Empleado registra una atención de ayer
- **WHEN** un empleado envía `realizadoEn` del día anterior
- **THEN** la API responde 403 con el mensaje "Solo un administrador puede registrar atenciones de días anteriores"

### Requirement: Listado de atenciones
La API SHALL exponer `GET /api/atenciones` con paginación estándar, orden `-realizadoEn` y filtros `desde`, `hasta` (días `YYYY-MM-DD` en la zona del negocio), `clienteId`, `metodoPago` y `estado` (por defecto `completada`). La respuesta SHALL incluir, además de la paginación, `resumen: { cantidad, total }` calculado sobre todo el filtro y no solo sobre la página. Cada atención SHALL incluir `cliente` (`id`, `nombre`, `apellido`) o vacío, y el nombre de quien la registró. Un `empleado` SHALL ver solo las atenciones del día actual, salvo el historial de un cliente (`clienteId`), que puede ver completo.

#### Scenario: Atenciones del día
- **WHEN** se pide `GET /api/atenciones?desde=2026-10-25&hasta=2026-10-25`
- **THEN** se devuelven las atenciones completadas de ese día con su cliente y el resumen del día

#### Scenario: Atención a las 23:30 hora de Portugal
- **WHEN** una atención se registra el 25 de octubre a las 23:30 en Lisboa
- **THEN** aparece al filtrar el día 2026-10-25 y no el 2026-10-26

#### Scenario: Historial de un cliente
- **WHEN** se pide `GET /api/atenciones?clienteId=<id>`
- **THEN** se devuelven todas las atenciones completadas de ese cliente, de la más reciente a la más antigua

#### Scenario: Empleado pide otro día
- **WHEN** un empleado pide atenciones de un día que no es hoy
- **THEN** la API responde 403 con el mensaje "Solo un administrador puede ver atenciones de otros días"

### Requirement: Detalle de una atención
La API SHALL exponer `GET /api/atenciones/:id` con la atención completa, el cliente (`id`, `nombre`, `apellido`, `cedula`, `telefono`, `email`) o vacío, el nombre de quien la registró y, si está anulada, la anulación con el nombre de quien la anuló. Es la base del detalle imprimible.

#### Scenario: Detalle de una atención con cliente
- **WHEN** se pide el detalle de una atención de Ana Silva
- **THEN** la respuesta incluye su número, fecha, servicios con precio de lista y cobrado, total, método de pago y los datos de contacto de Ana

### Requirement: Edición limitada
La API SHALL exponer `PATCH /api/atenciones/:id` que solo permite cambiar `metodoPago` y `notas`. Un `empleado` SHALL poder editar solo atenciones del día actual; un `admin`, cualquiera. Una atención anulada SHALL NOT poder editarse (409). Para corregir los servicios, el cliente o los precios, la atención SHALL anularse y registrarse de nuevo.

#### Scenario: Corregir el método de pago
- **WHEN** un empleado cambia el método de pago de una atención de hoy a `mbway`
- **THEN** la API responde 200 con la atención actualizada

### Requirement: Anulación
La API SHALL exponer `POST /api/atenciones/:id/anular`, exclusivo de `admin`, con `{ "motivo": string }` (obligatorio, 3 a 200 caracteres), que cambia el estado a `anulada`, guarda `anulacion: { motivo, anuladoPor, anuladoEn }` y responde 200. Anular una atención ya anulada SHALL responder 409 con el mensaje "La atención ya está anulada".

#### Scenario: Atención registrada por error
- **WHEN** el admin anula una atención con motivo "Registrada dos veces"
- **THEN** la atención queda `anulada` y deja de contar en el resumen del listado y en las métricas

### Requirement: Contadores del cliente
Registrar o anular una atención con cliente SHALL recalcular `ultimoServicioEn` (fecha de su última atención completada) y `totalServicios` (cantidad de atenciones completadas) del cliente.

#### Scenario: Anular la última atención del cliente
- **WHEN** se anula la atención más reciente de un cliente
- **THEN** su `ultimoServicioEn` pasa a la fecha de su atención completada anterior, o queda vacío si no tiene otra
