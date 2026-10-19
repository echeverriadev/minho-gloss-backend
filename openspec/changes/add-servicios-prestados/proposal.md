# Proposal

## Why

Registrar cada servicio realizado durante el día es lo que permite saber cuánto se facturó, qué servicios se venden más y cuándo volvió cada cliente. El registro tiene que ser muy rápido porque se hace en el patio mientras llegan los vehículos.

## What Changes

- Registro de un servicio prestado (`POST /api/servicios-prestados`) con copia del nombre y del precio de lista del tipo de servicio.
- Listado filtrable por rango de fechas, cliente, vehículo, tipo de servicio, método de pago y estado, con totales del filtro.
- Detalle de un servicio y edición limitada (notas y método de pago) el mismo día.
- Anulación con motivo, solo para `admin`, sin borrar el registro.
- Actualización de `ultimoServicioEn` y `totalServicios` del cliente al registrar o anular.

Fuera de alcance: varios servicios en un solo registro (se registran uno por uno), propinas, asignación del lavador que hizo el trabajo, estados intermedios ("en proceso", "listo para entregar") y recibos impresos.

## Capabilities

### New Capabilities
- `servicios-prestados`: registro, consulta y anulación de los servicios realizados a los vehículos.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/servicios-prestados/`.
- Usa `ClientesService`, `VehiculosService` y `TiposServicioService` exportados por sus módulos.
- Índices en `realizadoEn`, `clienteId` y `estado` para las consultas por día y las métricas.
- Depende de `add-auth`, `add-clientes` y `add-catalogo-servicios`. Lo usan `add-metricas` y `add-post-venta`.
