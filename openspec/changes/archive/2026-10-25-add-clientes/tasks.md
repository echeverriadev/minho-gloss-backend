# Tasks

## 1. Utilidades comunes

- [x] 1.1 Crear `normalizarTelefono` y `normalizarCedula` en `src/common/normalizacion/` con pruebas unitarias de casos con espacios, guiones, código de país y textos inválidos
- [x] 1.2 Agregar `DEFAULT_COUNTRY_CODE` a `configuration.ts` y `.env.example`
- [x] 1.3 Crear `ParseObjectIdPipe` y el DTO base de paginación (`page`, `limit`, `sort`, `q`) con la respuesta `{ items, total, page, limit }`

## 2. Clientes

- [x] 2.1 Crear esquema `Cliente` con índices únicos parciales en `telefono` y `cedula`, campo interno `busqueda` y campos `ultimoServicioEn` y `totalServicios`
- [x] 2.2 Implementar `ClientesService` (create, findAll con búsqueda `q`, findOne, update, remove, anonimizar)
- [x] 2.3 Implementar `ClientesController` con DTOs; `DELETE` y `anonimizar` solo para `admin`

## 3. Documentación

- [x] 3.1 Documentar en Swagger todos los endpoints con ejemplos y respuestas 400/401/403/404/409

## 4. Pruebas

- [x] 4.1 Pruebas unitarias de normalización, búsqueda y duplicados de teléfono y cédula
- [x] 4.2 Pruebas unitarias de la baja y la anonimización
- [x] 4.3 Pruebas e2e: alta, 409 por cédula repetida, búsqueda por nombre sin tilde, 403 de empleado al dar de baja
- [x] 4.4 Ejecutar `npm run check` y dejarlo en verde
