# Tasks

## 1. Módulo

- [x] 1.1 Definir `TIPOS_VEHICULO` y `TipoVehiculo` en `src/common/`
- [x] 1.2 Crear `src/modules/tipos-servicio/` con esquema `TipoServicio` (índice único parcial en `nombre` para activos, `categoria`, `modoPrecio`, `precios`, `precioUnico`, `orden`)
- [x] 1.3 Implementar `TiposServicioService` (findAll, findOne, create, update, remove, calcularPrecio)
- [x] 1.4 Implementar `TiposServicioController`: `GET` para autenticados y `POST`/`PATCH`/`DELETE` solo `admin`
- [x] 1.5 Validar que el modo de precio tenga sus precios y exportar `TiposServicioService`
- [x] 1.6 Crear `npm run seed:catalogo` con el catálogo actual del negocio

## 2. Documentación

- [x] 2.1 Documentar en Swagger los endpoints con ejemplos en céntimos y respuestas 400/401/403/404/409
- [x] 2.2 Explicar la carga inicial del catálogo en el README

## 3. Pruebas

- [x] 3.1 Pruebas unitarias de `calcularPrecio` (por vehículo y único) y de nombre repetido
- [x] 3.2 Pruebas e2e: crear como admin, 400 por precios incompletos, 403 como empleado, consulta ordenada por categoría
- [x] 3.3 Ejecutar `npm run check` y dejarlo en verde
