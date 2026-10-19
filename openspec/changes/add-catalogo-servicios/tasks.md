# Tasks

## 1. Módulo

- [ ] 1.1 Crear `src/modules/tipos-servicio/` con esquema `TipoServicio` (índice único parcial en `nombre` para activos, campo `orden`)
- [ ] 1.2 Implementar `TiposServicioService` (findAll, findOne, create, update, remove, calcularPrecio)
- [ ] 1.3 Implementar `TiposServicioController`: `GET` para autenticados y `POST`/`PATCH`/`DELETE` solo `admin`
- [ ] 1.4 Validar `preciosPorVehiculo` con un DTO anidado que solo acepte los tipos de vehículo de `domain-model`
- [ ] 1.5 Exportar `TiposServicioService` para `servicios-prestados`

## 2. Documentación

- [ ] 2.1 Documentar en Swagger los endpoints con ejemplos de precios en céntimos de euro y respuestas 400/401/403/404/409

## 3. Pruebas

- [ ] 3.1 Pruebas unitarias de `calcularPrecio` (con y sin precio por vehículo) y de nombre repetido
- [ ] 3.2 Pruebas e2e: crear como admin, 403 como empleado, consulta ordenada
- [ ] 3.3 Ejecutar `npm run check` y dejarlo en verde
