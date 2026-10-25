# Tasks

## 1. Vehículos

- [ ] 1.1 Crear `normalizarPlaca` en `src/common/normalizacion/` con pruebas unitarias
- [ ] 1.2 Crear esquema `Vehiculo` con índice único parcial en `placa` e índice en `clienteId`
- [ ] 1.3 Implementar `VehiculosService` (create, findByPlaca, update con traspaso, remove)
- [ ] 1.4 Implementar `POST /api/clientes/:id/vehiculos`, `GET /api/vehiculos/por-placa/:placa`, `PATCH` y `DELETE /api/vehiculos/:id`
- [ ] 1.5 Incluir las placas en el listado y la búsqueda `q` de clientes, y dar de baja los vehículos al dar de baja o anonimizar un cliente

## 2. Documentación

- [ ] 2.1 Documentar en Swagger todos los endpoints con ejemplos y respuestas 400/401/403/404/409

## 3. Pruebas

- [ ] 3.1 Pruebas unitarias de normalización, placa repetida y traspaso
- [ ] 3.2 Pruebas e2e: alta de vehículo, 409 por placa repetida, búsqueda por placa
- [ ] 3.3 Ejecutar `npm run check` y dejarlo en verde
