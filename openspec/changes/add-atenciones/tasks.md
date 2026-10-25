# Tasks

## 1. Módulo

- [x] 1.1 Crear `src/common/fechas/` con la conversión de días `YYYY-MM-DD` a rangos UTC según `APP_TIMEZONE` (con pruebas en el cambio de día y de horario)
- [x] 1.2 Agregar `APP_TIMEZONE` a `configuration.ts` y `.env.example`
- [x] 1.3 Crear el esquema `Atencion` con ítems embebidos e índices en `realizadoEn`, `clienteId`, `estado` y `numero` (único), y el contador de números
- [x] 1.4 Implementar `AtencionesService` (create con copia de catálogo y reglas de precio por rol, findAll con filtros y resumen, findOne con cliente, update limitado, anular)
- [x] 1.5 Recalcular los contadores del cliente al registrar y al anular, y vaciar la placa de las atenciones al anonimizar
- [x] 1.6 Implementar `AtencionesController` con las reglas de rol por fecha y `anular` solo `admin`
- [x] 1.7 Traducir al portugués los mensajes nuevos de la API

## 2. Documentación

- [x] 2.1 Documentar en Swagger los endpoints, los filtros y el `resumen`, con respuestas 400/401/403/404/409

## 3. Pruebas

- [x] 3.1 Pruebas unitarias del registro (valores por defecto, tipo inactivo, precio personalizado por rol, fecha futura, fecha pasada por rol)
- [x] 3.2 Pruebas unitarias de la anulación y del recálculo de contadores
- [x] 3.3 Prueba del filtro por día con una atención a las 23:30 hora de Portugal
- [x] 3.4 Pruebas e2e: registrar con y sin cliente, listar el día con resumen, detalle, anular como admin, 403 como empleado
- [x] 3.5 Ejecutar `npm run check` y dejarlo en verde
