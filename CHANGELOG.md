# Changelog

Todos los cambios importantes de la API de Minho Gloss se registran en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones usan **SemVer Simplificado** (`MAJOR.MINOR.PATCH`): `MAJOR` queda en 0 hasta completar la v1 del producto, `MINOR` sube con cada fase del roadmap y `PATCH` solo con correcciones (ver la spec `git-workflow`).

## [Sin publicar]

## [0.2.0] - 2026-10-25

Primera versión publicada. Incluye las fases 0, 1 y 2 del roadmap: entorno, especificaciones y la base funcional de la API (acceso, usuarios, clientes, catálogo de servicios y preferencias).

### Agregado

- **Entorno (fase 0):** proyecto NestJS 12 con TypeScript, MongoDB y Swagger, todo en Docker Compose (`api`, `mongo` y `mailpit`), sin instalar Node ni Mongo en la máquina. `GET /api/health` informa el estado de la API y de la base.
- **Especificaciones y calidad (fase 1):** desarrollo guiado por specs con OpenSpec, specs de alcance, dominio, arquitectura, estilo de código, entorno y flujo de Git; oxlint con chequeo de tipos, Prettier, Vitest y CI en GitHub Actions (tipos, lint, formato, pruebas unitarias y e2e, build y validación de specs).
- **Inicio de sesión:** `POST /api/auth/login` con JWT de 12 horas, límite de 5 intentos por minuto y el mismo mensaje para cualquier credencial incorrecta. Toda la API queda protegida por defecto, con roles `admin` y `empleado`.
- **Recuperación de contraseña por correo:** enlace de un solo uso que vence en 60 minutos (`/api/auth/recuperar-password` y `/api/auth/restablecer-password`). En desarrollo los correos se ven en Mailpit (http://localhost:8025); en producción se envían por SMTP.
- **Perfil propio:** `GET /api/auth/me` y cambio de la propia contraseña.
- **Usuarios** (solo admin): listar, crear, editar rol y nombre, desactivar, reactivar y restablecer contraseña. No hay registro público, siempre queda al menos un admin activo y el primer admin se crea desde el `.env`.
- **Clientes:** alta, búsqueda por nombre, apellido, cédula o teléfono (sin distinguir tildes), ficha, edición, baja lógica y borrado de datos personales (RGPD). Cédula libre normalizada y teléfono `+351` por defecto, ambos únicos; avisos de duplicado con el cliente que ya los usa.
- **Catálogo de servicios y extras:** cada entrada con título, descripción y precio para Ligeiro, SUV, Monovolume y Carrinha, o precio único; gestión solo para admin, precio de lista por tipo de vehículo y carga del catálogo actual con `npm run seed:catalogo`.
- **Preferencias por usuario:** idioma (`es` o `pt-PT`) y tema (`claro` u `oscuro`) guardados en la cuenta (`PATCH /api/auth/preferencias`).
- **Mensajes en portugués:** con `Accept-Language: pt` la API devuelve errores y validaciones en portugués de Portugal.
- Formato único de errores, validaciones en español, paginación estándar y validación de ids.
- 82 pruebas unitarias y 28 pruebas e2e contra MongoDB real.

### Corregido

- En desarrollo, el login funcionaba en la API pero la app no entraba al panel si se abría como `127.0.0.1` o desde el celular: CORS acepta ahora los orígenes locales y `CORS_ORIGIN` admite varios orígenes separados por comas.

[Sin publicar]: https://github.com/echeverriadev/minho-gloss-backend/compare/v0.2.0...develop
[0.2.0]: https://github.com/echeverriadev/minho-gloss-backend/releases/tag/v0.2.0
