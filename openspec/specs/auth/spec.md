# auth Specification

## Purpose
Inicio de sesión de los usuarios del negocio, recuperación de contraseña por correo, sesión con token y control de acceso por rol en toda la API de Minho Gloss.

## Requirements

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

### Requirement: Recuperación de contraseña por correo
La API SHALL exponer `POST /api/auth/recuperar-password`, público, con `{ "email": string }`. Si el correo pertenece a un usuario activo, SHALL generar un token aleatorio de un solo uso que vence a los `RESET_PASSWORD_EXPIRES_MINUTES` minutos (por defecto 60), guardar solo su hash y enviar al usuario un correo en español con el enlace `<FRONTEND_URL>/restablecer-password?token=<token>`. SHALL responder 204 en todos los casos, exista o no el correo. Pedir un enlace nuevo SHALL invalidar el anterior. SHALL aceptar como máximo 3 pedidos por minuto desde una misma IP.

#### Scenario: Usuario olvidó su contraseña
- **WHEN** un usuario activo pide recuperar su contraseña
- **THEN** la API responde 204 y le llega un correo con el enlace para elegir una contraseña nueva

#### Scenario: Correo que no existe
- **WHEN** se pide recuperar la contraseña de un correo no registrado
- **THEN** la API responde 204 igual y no envía ningún correo

### Requirement: Restablecer contraseña con el enlace
La API SHALL exponer `POST /api/auth/restablecer-password`, público, con `{ "token": string, "password": string }`. Si el token existe, no venció y la contraseña tiene al menos 8 caracteres, SHALL reemplazar la contraseña, invalidar el token y responder 204. Un token inexistente, vencido o ya usado SHALL responder 400 con el mensaje "El enlace no es válido o ya venció, pide uno nuevo".

#### Scenario: Elegir contraseña nueva
- **WHEN** el usuario envía el token del correo y una contraseña nueva válida
- **THEN** la API responde 204 y el usuario puede iniciar sesión solo con la contraseña nueva

#### Scenario: Enlace usado dos veces
- **WHEN** se usa por segunda vez un token que ya sirvió para cambiar la contraseña
- **THEN** la API responde 400 con el mensaje "El enlace no es válido o ya venció, pide uno nuevo"

### Requirement: Sin registro público
La API SHALL NOT exponer ningún endpoint público para crear cuentas. Los usuarios SHALL crearse solo desde `POST /api/usuarios`, exclusivo de `admin`.

#### Scenario: Alguien intenta registrarse
- **WHEN** una persona sin sesión llama a `POST /api/usuarios`
- **THEN** la API responde 401

### Requirement: Protección por defecto y roles
Todos los endpoints SHALL requerir sesión salvo los marcados como públicos (`POST /api/auth/login`, `POST /api/auth/recuperar-password`, `POST /api/auth/restablecer-password` y `GET /api/health`). Los endpoints marcados como exclusivos de `admin` SHALL responder 403 con el mensaje "No tienes permiso para esta acción" a un usuario con rol `empleado`.

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

### Requirement: Preferencias del usuario
La respuesta de `POST /api/auth/login` y de `GET /api/auth/me` SHALL incluir `preferencias: { idioma, tema }` del usuario. La API SHALL exponer `PATCH /api/auth/preferencias`, para cualquier usuario autenticado, con `{ idioma?, tema? }` (`idioma`: `es` o `pt-PT`; `tema`: `claro` u `oscuro`), que guarda solo las preferencias propias y responde 200 con las preferencias actualizadas.

#### Scenario: Cambiar a modo oscuro
- **WHEN** un empleado envía `PATCH /api/auth/preferencias` con `{ "tema": "oscuro" }`
- **THEN** la API responde 200 con `{ "idioma": "es", "tema": "oscuro" }` y el próximo login devuelve esas preferencias

#### Scenario: Idioma no soportado
- **WHEN** se envía `{ "idioma": "en" }`
- **THEN** la API responde 400 con el mensaje "El idioma debe ser es o pt-PT"

### Requirement: Mensajes de la API en el idioma del usuario
Cuando la petición trae el encabezado `Accept-Language` con `pt` (por ejemplo `pt-PT`), la API SHALL devolver los mensajes de error y de validación traducidos al portugués de Portugal; en cualquier otro caso SHALL devolverlos en español. Un mensaje sin traducción SHALL devolverse en español.

#### Scenario: Login incorrecto en portugués
- **WHEN** se llama a `POST /api/auth/login` con credenciales incorrectas y `Accept-Language: pt-PT`
- **THEN** la API responde 401 con el mensaje "Email ou palavra-passe incorretos"
