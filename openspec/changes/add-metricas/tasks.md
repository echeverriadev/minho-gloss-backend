# Tasks

## 1. Módulo

- [ ] 1.1 Crear `src/modules/metricas/` con `MetricasController` exclusivo de `admin` y DTO de rango (`desde`, `hasta`) con validación de orden y máximo de 366 días
- [ ] 1.2 Implementar el resumen con una agregación por rango (`$facet` para totales, por tipo, por método de pago y por tipo de vehículo)
- [ ] 1.3 Implementar el cálculo de clientes nuevos y recurrentes
- [ ] 1.4 Implementar el periodo anterior y las variaciones
- [ ] 1.5 Implementar la serie diaria con `$dateToString` en `APP_TIMEZONE` y relleno de días vacíos
- [ ] 1.6 Implementar clientes inactivos sobre `ultimoServicioEn`

## 2. Documentación

- [ ] 2.1 Documentar en Swagger los tres endpoints con ejemplos completos de respuesta

## 3. Pruebas

- [ ] 3.1 Pruebas con datos de ejemplo: anulados excluidos, ticket promedio, descuentos, variación con periodo anterior en 0
- [ ] 3.2 Prueba del corte de día en `Europe/Lisbon` (servicio a las 23:30 y a las 00:15)
- [ ] 3.3 Prueba de nuevos vs recurrentes y de días vacíos en la serie
- [ ] 3.4 Pruebas e2e: 403 de empleado, 400 por rango inválido
- [ ] 3.5 Ejecutar `npm run check` y dejarlo en verde
