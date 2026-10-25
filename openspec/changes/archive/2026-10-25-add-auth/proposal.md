# Proposal

## Why

Toda la información del autolavado (clientes, ingresos, datos de contacto) es privada, por lo que la API no puede abrirse a nadie sin sesión. Además, el dueño necesita separar lo que puede hacer un empleado de lo que solo él debe ver (métricas, precios, usuarios). Es la base de todos los demás módulos y por eso va primero en la fase 2.

## What Changes

- Inicio de sesión con correo y contraseña que devuelve un token JWT de acceso (`POST /api/auth/login`).
- Consulta del usuario de la sesión (`GET /api/auth/me`) y cambio de la propia contraseña (`POST /api/auth/cambiar-password`).
- Recuperación de contraseña por correo: el usuario pide un enlace (`POST /api/auth/recuperar-password`) y con él elige una contraseña nueva (`POST /api/auth/restablecer-password`).
- Sin registro público: las cuentas solo las crea un `admin` desde la gestión de usuarios.
- Protección de todos los endpoints por defecto, con marca explícita para los públicos y para los exclusivos del rol `admin`.
- Gestión de usuarios por el admin: listar, crear, editar, desactivar y restablecer contraseña (`/api/usuarios`).
- Creación automática del primer admin a partir de variables de entorno cuando la base no tiene usuarios.
- Límite de intentos de inicio de sesión y de recuperación de contraseña para frenar ataques de fuerza bruta.
- Envío de correos por SMTP, con Mailpit en `docker compose` para ver los correos en desarrollo sin enviarlos de verdad.

Fuera de alcance: refresh tokens, registro público de usuarios, inicio de sesión con Google u otros proveedores, autenticación de dos factores y permisos más finos que los dos roles.

## Capabilities

### New Capabilities
- `auth`: inicio de sesión, recuperación de contraseña por correo, sesión con JWT, protección por defecto de la API y control de acceso por rol.
- `usuarios`: gestión de las cuentas de usuario del negocio por parte del admin.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/auth/`, `src/modules/usuarios/`, guards y decoradores en `src/common/auth/`, envío de correo en `src/common/mail/` y filtro global de errores en `src/common/filters/`.
- `AppModule` registra un guard global de autenticación y otro de roles; `GET /api/health` pasa a marcarse como público.
- Dependencias nuevas: `@nestjs/jwt`, `@nestjs/throttler`, `bcryptjs` y `nodemailer` (ver `design.md`).
- `docker-compose.yml` agrega el servicio `mailpit` (bandeja de correo de desarrollo en http://localhost:8025).
- Variables de entorno nuevas: `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`, `FRONTEND_URL`, `RESET_PASSWORD_EXPIRES_MINUTES`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`.
- El frontend (`add-auth-ui`) consume estos endpoints.
