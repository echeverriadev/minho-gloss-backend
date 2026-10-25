# Spec Delta

## Purpose
La operación del día se registra por atención, con uno o más servicios prestados y un detalle imprimible.

## MODIFIED Requirements

### Requirement: Alcance de la v1
La v1 SHALL incluir exactamente estos módulos:
1. **Autenticación y usuarios**: inicio de sesión con correo y contraseña, cierre de sesión, gestión de usuarios por el admin.
2. **Clientes y vehículos**: alta, edición, búsqueda (nombre, teléfono, placa), baja lógica y ficha con historial de servicios.
3. **Catálogo de servicios**: tipos de servicio con precio base y precio opcional por tipo de vehículo.
4. **Operación del día**: registro rápido de cada atención con uno o más servicios prestados, cliente opcional (o alta rápida del cliente), precios personalizados por el admin, detalle imprimible de lo cobrado, listado del día y anulación.
5. **Métricas**: ingresos, cantidad de servicios por tipo, ticket promedio, clientes nuevos y recurrentes, por día y por rango de fechas.
6. **Post-venta**: lista periódica de clientes a contactar y contacto por correo, WhatsApp o llamada.

#### Scenario: Funcionalidad nueva propuesta
- **WHEN** alguien propone una funcionalidad que no está en esta lista
- **THEN** se registra como sugerencia en `openspec/decisiones-tecnicas.md` o se propone un cambio que modifique esta spec antes de implementarla

### Requirement: Glosario
Las specs, el código y la interfaz SHALL usar estos términos de forma consistente:
- **Cliente**: persona dueña de uno o varios vehículos que usa el autolavado.
- **Vehículo**: Ligeiro, SUV, Monovolume o Carrinha de un cliente, identificado por su placa.
- **Tipo de servicio**: entrada del catálogo que ofrece el negocio (por ejemplo EXPRESS GLOSS), con su precio según el tipo de vehículo.
- **Extra**: tipo de servicio adicional que se suma a un servicio (por ejemplo Higienização com ozono).
- **Atención**: la visita de un vehículo al autolavado, con uno o más servicios prestados, el total cobrado y el método de pago.
- **Servicio prestado**: cada servicio, extra o servicio personalizado realizado en una atención, con su precio cobrado.
- **Servicio personalizado**: servicio prestado que el admin agrega o cuyo precio cambia solo para esa atención, sin tocar el catálogo.
- **Detalle de la atención**: documento imprimible con lo realizado y lo cobrado; no es una factura fiscal.
- **Recordatorio**: contacto de post-venta programado para un cliente.
- **Usuario**: persona del negocio que inicia sesión en la app (admin o empleado).

#### Scenario: Nombrar una pantalla
- **WHEN** se crea la pantalla para anotar lo que se le hizo a un vehículo
- **THEN** se llama "Registrar servicio" y guarda una atención con sus servicios prestados, no "órdenes" ni "ventas"
