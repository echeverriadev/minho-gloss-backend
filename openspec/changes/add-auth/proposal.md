# Proposal

## Why

Toda la información del autolavado (clientes, ingresos, datos de contacto) es privada, por lo que la API no puede abrirse a nadie sin sesión. Además, el dueño necesita separar lo que puede hacer un empleado de lo que solo él debe ver (métricas, precios, usuarios). Es la base de todos los demás módulos y por eso va primero en la fase 2.

## What Changes

- Inicio de sesión con correo y contraseña que devuelve un token JWT de acceso (`POST /api/auth/login`).
- Consulta del usuario de la sesión (`GET /api/auth/me`) y cambio de la propia contraseña (`POST /api/auth/cambiar-password`).
- Protección de todos los endpoints por defecto, con marca explícita para los públicos y para los exclusivos del rol `admin`.
- Gestión de usuarios por el admin: listar, crear, editar, desactivar y restablecer contraseña (`/api/usuarios`).
- Creación automática del primer admin a partir de variables de entorno cuando la base no tiene usuarios.
- Límite de intentos de inicio de sesión para frenar ataques de fuerza bruta.

Fuera de alcance: refresh tokens, recuperación de contraseña por correo, inicio de sesión con Google u otros proveedores, autenticación de dos factores y permisos más finos que los dos roles.

## Capabilities

### New Capabilities
- `auth`: inicio de sesión, sesión con JWT, protección por defecto de la API y control de acceso por rol.
- `usuarios`: gestión de las cuentas de usuario del negocio por parte del admin.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/auth/`, `src/modules/usuarios/`, guards y decoradores en `src/common/auth/`.
- `AppModule` registra un guard global de autenticación y otro de roles; `GET /api/health` pasa a marcarse como público.
- Dependencias nuevas: `@nestjs/jwt`, `@nestjs/throttler` y `bcryptjs` (ver `design.md`).
- Variables de entorno nuevas: `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`.
- El frontend (`add-auth-ui`) consume estos endpoints.
