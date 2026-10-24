# Spec Delta

## Purpose
Inicio de sesión de los usuarios del negocio, sesión con token y control de acceso por rol en toda la API de Minho Gloss.

## ADDED Requirements

### Requirement: Inicio de sesión
La API SHALL exponer `POST /api/auth/login`, público, que recibe `{ "email": string, "password": string }`. Con credenciales correctas de un usuario activo SHALL responder 200 con `{ "accessToken": string, "expiresIn": number, "usuario": { "id", "nombre", "email", "rol" } }`. El correo SHALL compararse sin distinguir mayúsculas.

#### Scenario: Credenciales correctas
- **WHEN** un usuario activo envía su correo y contraseña correctos
- **THEN** la API responde 200 con un `accessToken` y los datos del usuario sin la contraseña

#### Scenario: Credenciales incorrectas
- **WHEN** el correo no existe o la contraseña no coincide
- **THEN** la API responde 401 con el mensaje "Correo o contraseña incorrectos", igual en ambos casos

#### Scenario: Usuario desactivado
- **WHEN** un usuario con `activo: false` intenta iniciar sesión con su contraseña correcta
- **THEN** la API responde 401 con el mismo mensaje "Correo o contraseña incorrectos"

### Requirement: Límite de intentos de inicio de sesión
La API SHALL aceptar como máximo 5 intentos de inicio de sesión por minuto desde una misma IP y SHALL responder 429 con el mensaje "Demasiados intentos, espera un minuto" a partir del sexto.

#### Scenario: Sexto intento en un minuto
- **WHEN** desde una IP se hacen 6 intentos de login en menos de un minuto
- **THEN** el sexto recibe 429 aunque las credenciales sean correctas

### Requirement: Sesión con token de acceso
El token de acceso SHALL ser un JWT firmado con `JWT_SECRET` que identifica al usuario y su rol, con vencimiento configurable por `JWT_EXPIRES_IN` (por defecto 12 horas). Las peticiones autenticadas SHALL enviar `Authorization: Bearer <token>`. Un token ausente, mal formado, vencido o de un usuario que ya no está activo SHALL recibir 401.

#### Scenario: Token vencido
- **WHEN** se llama a un endpoint protegido con un token vencido
- **THEN** la API responde 401 con el mensaje "La sesión venció, inicia sesión de nuevo"

#### Scenario: Usuario desactivado con token vigente
- **WHEN** el admin desactiva a un usuario que tiene un token vigente
- **THEN** la siguiente petición de ese usuario recibe 401

### Requirement: Usuario de la sesión
La API SHALL exponer `GET /api/auth/me`, que devuelve `{ "id", "nombre", "email", "rol" }` del usuario autenticado.

#### Scenario: Consultar la sesión
- **WHEN** un usuario autenticado llama a `GET /api/auth/me`
- **THEN** recibe sus datos actuales

### Requirement: Cambio de la propia contraseña
La API SHALL exponer `POST /api/auth/cambiar-password` con `{ "passwordActual": string, "passwordNueva": string }`. SHALL responder 204 si `passwordActual` es correcta y `passwordNueva` tiene al menos 8 caracteres, y 400 en otro caso.

#### Scenario: Contraseña actual incorrecta
- **WHEN** un usuario envía una `passwordActual` que no coincide
- **THEN** la API responde 400 con el mensaje "La contraseña actual no es correcta" y no cambia nada

### Requirement: Protección por defecto y roles
Todos los endpoints SHALL requerir sesión salvo los marcados como públicos (`POST /api/auth/login` y `GET /api/health`). Los endpoints marcados como exclusivos de `admin` SHALL responder 403 con el mensaje "No tienes permiso para esta acción" a un usuario con rol `empleado`.

#### Scenario: Petición sin token
- **WHEN** se llama a `GET /api/clientes` sin encabezado `Authorization`
- **THEN** la API responde 401

#### Scenario: Empleado en endpoint de admin
- **WHEN** un empleado llama a `POST /api/usuarios`
- **THEN** la API responde 403

### Requirement: Primer administrador
Al arrancar, si no existe ningún usuario y están definidas `ADMIN_EMAIL` y `ADMIN_PASSWORD`, la API SHALL crear un usuario `admin` activo con esos datos y con nombre `ADMIN_NOMBRE` (por defecto "Administrador"). Si ya existe algún usuario, SHALL NOT crear ni modificar nada.

#### Scenario: Primer arranque en producción
- **WHEN** la API arranca con la base vacía y las variables del admin definidas
- **THEN** se puede iniciar sesión con `ADMIN_EMAIL` y `ADMIN_PASSWORD`

#### Scenario: Arranque con usuarios existentes
- **WHEN** la API arranca y ya hay usuarios en la base
- **THEN** no se crea ningún usuario aunque las variables estén definidas

### Requirement: Secreto obligatorio en producción
Con `NODE_ENV=production`, la API SHALL negarse a arrancar si `JWT_SECRET` no está definido o tiene menos de 32 caracteres. En desarrollo MAY usar un secreto por defecto documentado en `.env.example`.

#### Scenario: Producción sin secreto
- **WHEN** la API arranca en producción sin `JWT_SECRET`
- **THEN** el proceso termina con un error que nombra la variable `JWT_SECRET`
