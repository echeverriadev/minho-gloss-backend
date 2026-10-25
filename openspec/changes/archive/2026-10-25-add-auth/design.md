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
- Registro público de usuarios: las cuentas las crea el admin.

## Decisions

1. **JWT de acceso sin refresh token, con vencimiento de 12 horas (`JWT_EXPIRES_IN=12h`).** Cubre una jornada; al vencer, el frontend vuelve al login. Alternativa evaluada: access + refresh token con rotación; descartada por complejidad para un negocio de pocos usuarios.
2. **El token se envía en el encabezado `Authorization: Bearer`.** Evita CSRF y simplifica CORS porque frontend y backend pueden estar en dominios gratuitos distintos. El frontend lo guarda en `localStorage` (riesgo XSS aceptado y mitigado con React, que escapa por defecto, y sin HTML de terceros).
3. **Payload mínimo: `sub` (id del usuario), `rol` y `nombre`.** En cada petición el guard verifica además que el usuario siga activo consultando la base (una lectura por id, barata), para que desactivar a alguien tenga efecto inmediato.
4. **Hash con `bcryptjs` (costo 10).** Implementación en JavaScript puro: no necesita compilar binarios nativos en `node:24-alpine` ni en el hosting gratuito. Alternativas: `bcrypt` nativo (requiere herramientas de compilación), `argon2` (nativo) o `node:crypto.scrypt` (sin dependencia, pero hay que diseñar el formato del hash a mano).
5. **Guards globales con `APP_GUARD`: `JwtAuthGuard` y luego `RolesGuard`.** Decoradores `@Public()` y `@Roles('admin')` en `src/common/auth/`. Un decorador `@UsuarioActual()` entrega el usuario de la sesión a los controladores.
6. **Límite de intentos con `@nestjs/throttler`, en memoria:** 5 intentos de login por minuto por IP. Con una sola instancia de la API no hace falta Redis.
7. **Primer admin por variables de entorno.** Al arrancar, si no existe ningún usuario y están definidas `ADMIN_EMAIL` y `ADMIN_PASSWORD`, se crea el admin y se registra en el log (sin la contraseña). Alternativa: comando de consola `npm run seed:admin`; se deja como mejora.
8. **Recuperación de contraseña con token de un solo uso.** `POST /api/auth/recuperar-password` genera 32 bytes aleatorios (`node:crypto`), guarda en el usuario solo su hash SHA-256 y el vencimiento (60 minutos, `RESET_PASSWORD_EXPIRES_MINUTES`) y envía un correo con el enlace `${FRONTEND_URL}/restablecer-password?token=<token>`. Responde 204 siempre, exista o no el correo, para no revelar qué cuentas existen. `POST /api/auth/restablecer-password` busca por el hash, verifica el vencimiento, guarda la contraseña nueva y borra el token. Pedir otro enlace invalida el anterior. Alternativa: JWT firmado como token de recuperación; descartada porque no se puede invalidar después de usarlo sin guardar estado igual.
9. **Correo por SMTP con `nodemailer`**, detrás de un `MailService` en `src/common/mail/` que también usará post-venta. En desarrollo `docker compose` levanta **Mailpit** (gratuito, imagen `axllent/mailpit`), que recibe todo por SMTP en el puerto 1025 y lo muestra en http://localhost:8025 sin enviar nada a internet. En producción se configuran `SMTP_*` con un proveedor gratuito: Resend (100 correos al día, también acepta SMTP), Brevo (300 al día) o Gmail con contraseña de aplicación. Sin `SMTP_HOST`, el correo no se envía y se registra una advertencia (sin el token). Alternativa: SDK HTTP de Resend; descartada para no atar el código a un proveedor, porque SMTP sirve con todos.
10. **Mismo mensaje para correo inexistente y contraseña incorrecta** ("Correo o contraseña incorrectos") para no revelar qué correos existen.

## Risks / Trade-offs

- [Token robado válido hasta 12 h] → vencimiento corto, HTTPS en producción y la verificación de usuario activo permite cortarlo desactivando al usuario.
- [Throttler en memoria se reinicia con la API] → aceptable para el volumen del negocio; si se escala a varias instancias habría que mover el almacenamiento.
- [El enlace de recuperación llega a un correo comprometido] → vence en 60 minutos, es de un solo uso y el admin sigue pudiendo restablecer contraseñas a mano.
- [`bcryptjs` es más lento que el nativo] → con costo 10 un login tarda decenas de milisegundos, irrelevante con pocos usuarios.
