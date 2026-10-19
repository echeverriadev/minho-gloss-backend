# Tasks

## 1. Módulo

- [ ] 1.1 Crear `src/modules/servicios-prestados/` con esquema `ServicioPrestado` e índices en `realizadoEn`, `clienteId`, `vehiculoId` y `estado`
- [ ] 1.2 Crear una utilidad de zona horaria en `src/common/fechas/` que convierta días `YYYY-MM-DD` en rangos UTC según `APP_TIMEZONE` (con pruebas en el cambio de día)
- [ ] 1.3 Agregar `APP_TIMEZONE` y `APP_CURRENCY` a `configuration.ts` y `.env.example`
- [ ] 1.4 Implementar `ServiciosPrestadosService` (create con copia de nombre y precio, findAll con filtros y resumen por agregación, findOne, update limitado, anular)
- [ ] 1.5 Recalcular los contadores del cliente al registrar y al anular
- [ ] 1.6 Implementar `ServiciosPrestadosController` con las reglas de rol por fecha y `anular` solo `admin`

## 2. Documentación

- [ ] 2.1 Documentar en Swagger los endpoints, los filtros y el `resumen`, con respuestas 400/401/403/404/409

## 3. Pruebas

- [ ] 3.1 Pruebas unitarias del registro (valores por defecto, tipo inactivo, fecha futura, fecha pasada por rol)
- [ ] 3.2 Pruebas unitarias de la anulación y del recálculo de contadores
- [ ] 3.3 Prueba del filtro por día con un servicio a las 23:30 hora de Portugal
- [ ] 3.4 Pruebas e2e: registrar, listar el día con resumen, anular como admin, 403 como empleado
- [ ] 3.5 Ejecutar `npm run check` y dejarlo en verde
