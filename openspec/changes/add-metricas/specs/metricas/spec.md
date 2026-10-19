# Spec Delta

## Purpose
Indicadores de negocio del autolavado calculados a partir de los servicios prestados: ingresos, cantidad, ticket promedio, desgloses y comportamiento de los clientes, por día y por rango de fechas.

## ADDED Requirements

### Requirement: Acceso a las métricas
Todos los endpoints de `/api/metricas` SHALL ser exclusivos del rol `admin`, SHALL excluir los servicios anulados y SHALL interpretar `desde` y `hasta` (formato `YYYY-MM-DD`, ambos inclusive) como días en la zona horaria del negocio. Si no se envían, el rango por defecto SHALL ser el día actual. Un rango con `desde` posterior a `hasta` o de más de 366 días SHALL responder 400.

#### Scenario: Empleado pide métricas
- **WHEN** un empleado llama a `GET /api/metricas/resumen`
- **THEN** la API responde 403

#### Scenario: Rango demasiado largo
- **WHEN** se pide un rango de dos años
- **THEN** la API responde 400 con el mensaje "El rango máximo es de 366 días"

### Requirement: Resumen del periodo
La API SHALL exponer `GET /api/metricas/resumen?desde&hasta`, que responde con:
- `ingresos`: suma de `precioCobrado`.
- `cantidadServicios` y `ticketPromedio` (ingresos / cantidad, redondeado; 0 si no hay servicios).
- `descuentos`: suma de `precioLista - precioCobrado` cuando es positiva.
- `porTipoServicio`: `[{ tipoServicioId, nombre, cantidad, ingresos }]` ordenado por ingresos descendente.
- `porMetodoPago` y `porTipoVehiculo`: `[{ clave, cantidad, ingresos }]`.
- `clientes`: `{ atendidos, nuevos, recurrentes }`.
- `periodoAnterior`: `{ desde, hasta, ingresos, cantidadServicios, variacionIngresos, variacionCantidad }`, con variaciones en porcentaje o `null` si el periodo anterior es 0.

#### Scenario: Resumen de un día
- **WHEN** el 18 de octubre se registraron 3 servicios de 20000, 20000 y 35000, y uno de ellos fue anulado
- **THEN** el resumen de ese día tiene `cantidadServicios` 2 y los ingresos de los dos servicios no anulados

#### Scenario: Comparación con la semana anterior
- **WHEN** se pide el resumen del 12 al 18 de octubre
- **THEN** `periodoAnterior` corresponde al 5 al 11 de octubre

### Requirement: Clientes nuevos y recurrentes
Un cliente atendido en el rango SHALL contarse como `nuevo` si su primer servicio completado está dentro del rango, y como `recurrente` si tiene algún servicio completado anterior a `desde`. `atendidos` SHALL ser la suma de ambos.

#### Scenario: Cliente que vuelve
- **WHEN** un cliente tuvo un servicio en septiembre y otro en octubre
- **THEN** en el resumen de octubre cuenta como recurrente

### Requirement: Serie diaria
La API SHALL exponer `GET /api/metricas/serie-diaria?desde&hasta`, que responde `[{ fecha: "YYYY-MM-DD", ingresos, cantidadServicios }]` con un elemento por cada día del rango, en orden, incluyendo los días sin servicios con valores 0.

#### Scenario: Día sin servicios
- **WHEN** el lunes del rango no se registraron servicios
- **THEN** la serie incluye ese lunes con `ingresos` 0 y `cantidadServicios` 0

### Requirement: Clientes inactivos
La API SHALL exponer `GET /api/metricas/clientes-inactivos?dias=<n>` (por defecto 30, entre 7 y 365) con paginación estándar, que devuelve los clientes activos cuyo `ultimoServicioEn` es anterior a hoy menos `n` días, ordenados del más antiguo al más reciente, con `id`, `nombre`, `telefono`, `ultimoServicioEn`, `totalServicios` y `aceptaContacto`. La respuesta SHALL incluir el total de clientes inactivos.

#### Scenario: Clientes que no vuelven hace un mes
- **WHEN** se pide `GET /api/metricas/clientes-inactivos?dias=30`
- **THEN** se listan los clientes cuyo último servicio fue hace más de 30 días, primero los que llevan más tiempo sin venir
