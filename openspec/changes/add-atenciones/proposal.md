# Proposal

## Why

El dueño quiere registrar la operación del día: cada vehículo que se atiende, con todos los servicios y extras que se le hicieron, lo cobrado y el método de pago. Con eso se podrán calcular métricas (en otro cambio) y conocer la gestión del autolavado. En la visita, un cliente puede pedir varios servicios, puede no querer registrarse, y el admin puede hacer un descuento o cobrar un servicio fuera del catálogo sin tocar los precios base.

Este cambio reemplaza a `add-servicios-prestados`, que registraba un servicio por registro y exigía un vehículo registrado.

## What Changes

- Registro de una atención (`POST /api/atenciones`) con uno o más servicios prestados, cliente opcional, tipo de vehículo, placa opcional, método de pago y notas. La API copia nombre, categoría y precio de lista de cada servicio del catálogo y calcula el total.
- Precios personalizados solo para `admin`: cobrar un precio distinto del de lista o agregar un servicio personalizado (nombre y precio). El catálogo no cambia.
- Número correlativo por atención y detalle completo (`GET /api/atenciones/:id`) con los datos del cliente, para el detalle imprimible.
- Listado filtrable por días (zona del negocio), cliente, método de pago y estado, con resumen de cantidad y total del filtro.
- Edición limitada (método de pago y notas) y anulación con motivo, solo para `admin`.
- Contadores del cliente (`ultimoServicioEn`, `totalServicios`) recalculados al registrar y al anular.
- La anonimización de un cliente vacía la placa de sus atenciones.

Fuera de alcance: gestión de vehículos por placa (`add-vehiculos`), métricas (`add-metricas`), facturas fiscales o certificadas (AT), propinas, asignación del lavador y estados intermedios ("en proceso", "listo").

## Capabilities

### New Capabilities
- `atenciones`: registro, consulta, detalle, corrección y anulación de la operación diaria.

### Modified Capabilities
- `domain-model`: la entidad `ServicioPrestado` se reemplaza por `Atencion` con ítems; contadores del cliente y RGPD.
- `product-scope`: módulo "Operación del día" y glosario (atención, servicio personalizado, detalle).

## Impact

- Código nuevo: `src/modules/atenciones/` y `src/common/fechas/`.
- `ClientesService` exporta la actualización de contadores y la anonimización vacía las placas de las atenciones.
- `APP_TIMEZONE` en `configuration.ts` y `.env.example`.
- El frontend (`add-atenciones-ui`) consume estos endpoints.
