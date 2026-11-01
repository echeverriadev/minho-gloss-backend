# Design

## Context

El registro se hace de pie en el patio, desde el celular, y la mayoría de las visitas son de un servicio más algún extra. El precio depende del tipo de vehículo, que siempre se conoce aunque el cliente no se registre.

## Goals / Non-Goals

**Goals:**
- Una sola llamada guarda la visita completa con el total ya calculado por la API.
- Los precios y nombres quedan copiados en la atención, para que el historial no cambie con el catálogo.

**Non-Goals:**
- Facturación fiscal: el detalle es informativo, sin serie ni comunicación a la AT.

## Decisions

1. **Atención con ítems embebidos** (un documento por visita, `items` como subdocumentos) en lugar de un documento por servicio prestado. La visita se lee, anula e imprime entera; las métricas por tipo de servicio usan `$unwind` sobre `items`.
2. **Tipo de vehículo y placa en la atención**, sin exigir un `Vehiculo` registrado. Cuando exista `add-vehiculos` se podrá agregar un `vehiculoId` opcional sin romper nada.
3. **Precio validado por rol en la API**: el empleado puede omitir `precio` o enviarlo igual al de lista; si envía otro precio o un ítem personalizado recibe 403. Así la regla no depende de la interfaz.
4. **Número correlativo** con un contador atómico en la colección `contadores` (`findOneAndUpdate` con `$inc` y `upsert`). Un número usado por una atención anulada no se reutiliza.
5. **Datos del cliente sin copiar**: la atención guarda solo `clienteId` y el nombre se busca al leer. Así un cliente anonimizado deja de verse en todas sus atenciones sin reescribirlas; solo la placa, que sí se guarda en la atención, se vacía al anonimizar.
6. **Días en la zona del negocio**: `desde` y `hasta` (`YYYY-MM-DD`) se convierten en un rango UTC con `Intl.DateTimeFormat` para `APP_TIMEZONE`, sin dependencias nuevas, respetando el cambio de horario.
7. **Contadores del cliente recalculados** (no incrementados) con una consulta a sus atenciones completadas, para que anular siempre deje valores correctos.

## Risks / Trade-offs

- [El contador de números y la atención no se guardan en una transacción] → si falla el guardado queda un número sin usar; es aceptable porque el detalle no es fiscal.
- [Placas mal escritas] → se normalizan; la búsqueda por placa llega con `add-vehiculos`.
