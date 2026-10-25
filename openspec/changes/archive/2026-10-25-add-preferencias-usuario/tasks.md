# Tasks

## 1. Preferencias

- [x] 1.1 Agregar `preferencias` al esquema `Usuario`, a la sesión y a las respuestas de `login` y `me`
- [x] 1.2 Implementar `PATCH /api/auth/preferencias` con su DTO y documentación de Swagger

## 2. Mensajes en portugués

- [x] 2.1 Crear el diccionario de mensajes `es` → `pt-PT` en `src/common/i18n/`, con patrones para los mensajes con datos
- [x] 2.2 Traducir en el filtro global de errores según `Accept-Language`

## 3. Pruebas

- [x] 3.1 Pruebas unitarias de la traducción de mensajes y de las preferencias
- [x] 3.2 Pruebas e2e: cambiar preferencias, 400 por idioma inválido, login incorrecto en portugués
- [x] 3.3 Ejecutar `npm run check` y dejarlo en verde
