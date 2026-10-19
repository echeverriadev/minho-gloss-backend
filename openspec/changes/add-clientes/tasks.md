# Tasks

## 1. Utilidades comunes

- [ ] 1.1 Crear `normalizarTelefono` y `normalizarPlaca` en `src/common/normalizacion/` con pruebas unitarias de casos con espacios, guiones, código de país y textos inválidos
- [ ] 1.2 Agregar `DEFAULT_COUNTRY_CODE` a `configuration.ts` y `.env.example`
- [ ] 1.3 Crear `ParseObjectIdPipe` y el DTO base de paginación (`page`, `limit`, `sort`, `q`) con la respuesta `{ items, total, page, limit }`

## 2. Clientes

- [ ] 2.1 Crear esquema `Cliente` con índice único parcial en `telefono` y campos `ultimoServicioEn` y `totalServicios`
- [ ] 2.2 Implementar `ClientesService` (create con vehículos en una transacción o con compensación, findAll con búsqueda `q`, findOne con vehículos, update, remove con baja de vehículos, actualizarContadores)
- [ ] 2.3 Implementar `ClientesController` con DTOs; `DELETE` solo para `admin`

## 3. Vehículos

- [ ] 3.1 Crear esquema `Vehiculo` con índice único parcial en `placa` e índice en `clienteId`
- [ ] 3.2 Implementar `VehiculosService` (create, findByPlaca, update con traspaso, remove)
- [ ] 3.3 Implementar `POST /api/clientes/:id/vehiculos`, `GET /api/vehiculos/por-placa/:placa`, `PATCH` y `DELETE /api/vehiculos/:id`

## 4. Documentación

- [ ] 4.1 Documentar en Swagger todos los endpoints con ejemplos y respuestas 400/401/403/404/409

## 5. Pruebas

- [ ] 5.1 Pruebas unitarias de búsqueda (nombre sin tilde, prefijo de teléfono, prefijo de placa) y de duplicados
- [ ] 5.2 Pruebas unitarias de la baja de cliente con sus vehículos
- [ ] 5.3 Pruebas e2e: alta con vehículo, 409 por placa repetida, búsqueda por placa, 403 de empleado al dar de baja
- [ ] 5.4 Ejecutar `npm run check` y dejarlo en verde
