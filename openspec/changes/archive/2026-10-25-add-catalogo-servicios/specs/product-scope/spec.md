# Spec Delta

## Purpose
Glosario con los tipos de vehículo y los extras del negocio.

## MODIFIED Requirements

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
