# Design

## Context

La API ya tiene prefijo `/api`, validación global y Swagger con `addBearerAuth()`. No hay usuarios ni sesión. El negocio tiene un dueño y pocos empleados (menos de 10 usuarios), un solo local y uso desde celulares durante la jornada.

## Goals / Non-Goals

**Goals:**
- Sesión simple que dure una jornada laboral sin pedir login a cada rato.
- Seguridad razonable sin costo: contraseñas con hash, secreto fuera del repo, límite de intentos.
- Que olvidar proteger un endpoint sea imposible: protegido por defecto.

**Non-Goals:**
- Revocar tokens en caliente o cerrar sesión en todos los dispositivos (se acepta esperar a que venzan).
- Recuperación de contraseña por correo (la hace el admin).

## Decisions

1. **JWT de acceso sin refresh token, con vencimiento de 12 horas (`JWT_EXPIRES_IN=12h`).** Cubre una jornada; al vencer, el frontend vuelve al login. Alternativa evaluada: access + refresh token con rotación; descartada por complejidad para un negocio de pocos usuarios.
2. **El token se envía en el encabezado `Authorization: Bearer`.** Evita CSRF y simplifica CORS porque frontend y backend pueden estar en dominios gratuitos distintos. El frontend lo guarda en `localStorage` (riesgo XSS aceptado y mitigado con React, que escapa por defecto, y sin HTML de terceros).
3. **Payload mínimo: `sub` (id del usuario), `rol` y `nombre`.** En cada petición el guard verifica además que el usuario siga activo consultando la base (una lectura por id, barata), para que desactivar a alguien tenga efecto inmediato.
4. **Hash con `bcryptjs` (costo 10).** Implementación en JavaScript puro: no necesita compilar binarios nativos en `node:24-alpine` ni en el hosting gratuito. Alternativas: `bcrypt` nativo (requiere herramientas de compilación), `argon2` (nativo) o `node:crypto.scrypt` (sin dependencia, pero hay que diseñar el formato del hash a mano).
5. **Guards globales con `APP_GUARD`: `JwtAuthGuard` y luego `RolesGuard`.** Decoradores `@Public()` y `@Roles('admin')` en `src/common/auth/`. Un decorador `@UsuarioActual()` entrega el usuario de la sesión a los controladores.
6. **Límite de intentos con `@nestjs/throttler`, en memoria:** 5 intentos de login por minuto por IP. Con una sola instancia de la API no hace falta Redis.
7. **Primer admin por variables de entorno.** Al arrancar, si no existe ningún usuario y están definidas `ADMIN_EMAIL` y `ADMIN_PASSWORD`, se crea el admin y se registra en el log (sin la contraseña). Alternativa: comando de consola `npm run seed:admin`; se deja como mejora.
8. **Mismo mensaje para correo inexistente y contraseña incorrecta** ("Correo o contraseña incorrectos") para no revelar qué correos existen.

## Risks / Trade-offs

- [Token robado válido hasta 12 h] → vencimiento corto, HTTPS en producción y la verificación de usuario activo permite cortarlo desactivando al usuario.
- [Throttler en memoria se reinicia con la API] → aceptable para el volumen del negocio; si se escala a varias instancias habría que mover el almacenamiento.
- [`bcryptjs` es más lento que el nativo] → con costo 10 un login tarda decenas de milisegundos, irrelevante con pocos usuarios.
