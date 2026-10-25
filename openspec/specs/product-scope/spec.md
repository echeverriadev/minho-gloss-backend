# product-scope Specification

## Purpose
Visión, usuarios y alcance de la versión 1 de Minho Gloss, la app de gestión de un autolavado. Es la referencia para decidir si una funcionalidad entra o no en la v1 y se comparte sin cambios entre el repo del backend y el del frontend.

## Requirements

### Requirement: Visión del producto
Minho Gloss SHALL permitir al autolavado registrar a sus clientes y vehículos, anotar cada servicio prestado durante el día con su tipo y precio, consultar métricas de esos servicios y recordar periódicamente a los clientes que el negocio sigue a su disposición. El producto SHALL poder operarse completo desde un celular en el patio del autolavado.

#### Scenario: Jornada típica
- **WHEN** llega un vehículo al autolavado
- **THEN** un empleado busca al cliente por placa o teléfono desde el celular
- **AND** registra el servicio prestado en menos de 30 segundos si el cliente ya existe
- **AND** al final del día el dueño consulta cuántos servicios se hicieron y cuánto se facturó

### Requirement: Usuarios y roles
La v1 SHALL tener dos roles de usuario:
- `admin` (dueño del negocio): todo lo del rol `empleado`, más gestionar usuarios, el catálogo de tipos de servicio y sus precios, anular servicios, ver métricas y gestionar la post-venta.
- `empleado`: iniciar sesión, buscar, crear y editar clientes y vehículos, y registrar servicios prestados.

Los clientes del autolavado SHALL NOT tener acceso a la app en la v1.

#### Scenario: Empleado intenta ver métricas
- **WHEN** un usuario con rol `empleado` intenta abrir las métricas
- **THEN** la app no muestra la opción en la navegación
- **AND** la API responde 403 si se llama directamente

### Requirement: Alcance de la v1
La v1 SHALL incluir exactamente estos módulos:
1. **Autenticación y usuarios**: inicio de sesión con correo y contraseña, cierre de sesión, gestión de usuarios por el admin.
2. **Clientes y vehículos**: alta, edición, búsqueda (nombre, teléfono, placa), baja lógica y ficha con historial de servicios.
3. **Catálogo de servicios**: tipos de servicio con precio base y precio opcional por tipo de vehículo.
4. **Servicios prestados**: registro rápido de cada servicio, listado del día y anulación.
5. **Métricas**: ingresos, cantidad de servicios por tipo, ticket promedio, clientes nuevos y recurrentes, por día y por rango de fechas.
6. **Post-venta**: lista periódica de clientes a contactar y contacto por correo, WhatsApp o llamada.

#### Scenario: Funcionalidad nueva propuesta
- **WHEN** alguien propone una funcionalidad que no está en esta lista
- **THEN** se registra como sugerencia en `openspec/decisiones-tecnicas.md` o se propone un cambio que modifique esta spec antes de implementarla

### Requirement: Fuera de alcance de la v1
La v1 SHALL NOT incluir: agenda o reservas de turnos, pagos en línea, facturación electrónica, inventario de insumos, nómina o comisiones de empleados, varias sucursales, app nativa, portal para clientes ni envío automático de WhatsApp mediante una API de pago.

#### Scenario: Pedido de reservas en línea
- **WHEN** se pide que los clientes reserven turno desde la web
- **THEN** se responde que está fuera de la v1 y se anota como sugerencia para una versión futura

### Requirement: Costo de operación mínimo
El producto SHALL poder operarse con costo mensual cero o cercano a cero, usando planes gratuitos (por ejemplo MongoDB Atlas M0, hosting estático gratuito y un plan gratuito de correo). Ninguna funcionalidad de la v1 SHALL depender de un servicio de pago.

#### Scenario: Elegir proveedor de correo
- **WHEN** se implementa el envío de correos de post-venta
- **THEN** el proveedor elegido tiene un plan gratuito suficiente para el volumen esperado (decenas de correos al día)

### Requirement: Contexto regional
La app SHALL estar en español. El negocio está en Braga (Portugal), por lo que por defecto SHALL usar la zona horaria `Europe/Lisbon` (con su cambio de horario de verano), la moneda euro (EUR, con dos decimales), el formato regional `es-ES` para los textos en español y el prefijo telefónico `+351`; estos valores SHALL poder cambiarse por configuración sin tocar código.

#### Scenario: Fin del día
- **WHEN** se registra un servicio a las 23:30 hora de Portugal
- **THEN** cuenta para las métricas de ese día y no del siguiente, aunque en UTC ya sea otro día

### Requirement: Glosario
Las specs, el código y la interfaz SHALL usar estos términos de forma consistente:
- **Cliente**: persona dueña de uno o varios vehículos que usa el autolavado.
- **Vehículo**: Ligeiro, SUV, Monovolume o Carrinha de un cliente, identificado por su placa.
- **Tipo de servicio**: entrada del catálogo que ofrece el negocio (por ejemplo EXPRESS GLOSS), con su precio según el tipo de vehículo.
- **Extra**: tipo de servicio adicional que se suma a un servicio (por ejemplo Higienização com ozono).
- **Servicio prestado**: un servicio realizado a un vehículo en una fecha y hora, con el precio cobrado.
- **Recordatorio**: contacto de post-venta programado para un cliente.
- **Usuario**: persona del negocio que inicia sesión en la app (admin o empleado).

#### Scenario: Nombrar una pantalla
- **WHEN** se crea la pantalla para anotar lo que se le hizo a un vehículo
- **THEN** se llama "Registrar servicio" y trabaja con servicios prestados, no con "órdenes" ni "ventas"
