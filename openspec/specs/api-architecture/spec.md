# api-architecture Specification

## Purpose
Estructura y reglas técnicas de la API de Minho Gloss (NestJS + MongoDB + Swagger): organización en módulos, responsabilidades por capa, convenciones HTTP (rutas, paginación, errores, fechas y montos), seguridad por defecto y documentación, para que cada dominio de negocio (autenticación, clientes, servicios, métricas, post-venta) se agregue de forma uniforme.

## Requirements

### Requirement: Organización por módulos de dominio
El código SHALL organizarse en `src/modules/<dominio>/` con un módulo de NestJS por dominio, que contiene su controlador, servicio, DTOs (`dto/`) y esquemas de Mongoose (`schemas/`). El código transversal (guards, filtros, interceptores, decoradores, pipes y utilidades) SHALL ir en `src/common/` y la configuración en `src/config/`. Un módulo SHALL usar otro solo a través de los providers que este exporta. Los módulos previstos para la v1 SHALL ser `auth`, `usuarios`, `clientes`, `vehiculos`, `tipos-servicio`, `servicios-prestados`, `metricas`, `post-venta` y `health`.

#### Scenario: Agregar el dominio de clientes
- **WHEN** se implementa la gestión de clientes
- **THEN** se crea `src/modules/clientes/` (por ejemplo con `npx nest g resource modules/clientes`)
- **AND** se registra `ClientesModule` en `AppModule`

### Requirement: Responsabilidades por capa
Los controladores SHALL limitarse a recibir la petición HTTP, validar con DTOs, obtener el usuario de la sesión y delegar en servicios. La lógica de negocio SHALL vivir en los servicios y el acceso a datos SHALL hacerse con modelos de Mongoose inyectados en los servicios. Los controladores SHALL devolver DTOs de respuesta, nunca documentos de Mongoose crudos, para no filtrar campos internos (`_id`, `__v`, hashes).

#### Scenario: Regla de negocio nueva
- **WHEN** se agrega una regla, como calcular el precio de lista de un servicio
- **THEN** se implementa en el servicio y se prueba con un test unitario del servicio

#### Scenario: Respuesta de un usuario
- **WHEN** se devuelve un usuario
- **THEN** la respuesta tiene `id` en lugar de `_id` y nunca incluye el hash de la contraseña

### Requirement: Rutas REST
Todas las rutas SHALL colgar del prefijo `/api`. Los recursos SHALL nombrarse en español, en plural y en `kebab-case` (`/api/clientes`, `/api/tipos-servicio`, `/api/servicios-prestados`). Las operaciones SHALL usar: `GET /recurso` (listar), `GET /recurso/:id` (detalle), `POST /recurso` (crear, responde 201), `PATCH /recurso/:id` (actualizar parcialmente), `DELETE /recurso/:id` (baja lógica, responde 204). Las acciones que no son CRUD SHALL modelarse como subrecursos con verbo (`POST /api/servicios-prestados/:id/anular`). Los parámetros `:id` SHALL validarse como ObjectId y responder 400 si no lo son.

#### Scenario: Id con formato inválido
- **WHEN** se pide `GET /api/clientes/123`
- **THEN** la API responde 400 indicando que el id no es válido, sin consultar la base

### Requirement: Paginación, búsqueda y orden
Los listados SHALL aceptar `page` (desde 1, por defecto 1) y `limit` (por defecto 20, máximo 100), y responder `{ "items": [...], "total": <n>, "page": <n>, "limit": <n> }`. La búsqueda de texto SHALL usar el parámetro `q` y el orden `sort` con el nombre del campo, precedido de `-` para descendente (`sort=-createdAt`). Los listados SHALL devolver por defecto solo registros activos, y MAY aceptar `incluirInactivos=true` para el rol `admin`.

#### Scenario: Segunda página de clientes
- **WHEN** se pide `GET /api/clientes?page=2&limit=20`
- **THEN** la respuesta trae los clientes 21 a 40 y `total` con la cantidad total de clientes activos

### Requirement: Formato de datos
Los cuerpos SHALL ser JSON con propiedades en `camelCase`. Las fechas SHALL enviarse y recibirse en ISO 8601; las que guarda la API SHALL estar en UTC. Los parámetros de rango por día (`desde`, `hasta`) SHALL aceptar fechas `YYYY-MM-DD` interpretadas en la zona horaria del negocio (`APP_TIMEZONE`, por defecto `America/Bogota`), con `hasta` inclusivo. Los montos SHALL ser enteros en la unidad mínima de la moneda (`APP_CURRENCY`, por defecto `COP`).

#### Scenario: Servicios de un día
- **WHEN** se pide `GET /api/servicios-prestados?desde=2026-10-18&hasta=2026-10-18`
- **THEN** la API devuelve los servicios entre las 00:00 y las 23:59:59.999 hora de Bogotá de ese día

### Requirement: Validación de entrada
La API SHALL validar todos los cuerpos, parámetros de ruta y de consulta con `class-validator` mediante un `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform` activados, rechazando propiedades no declaradas en el DTO. Los textos SHALL recortarse (`trim`) antes de validarse. Los mensajes de validación SHALL estar en español.

#### Scenario: Cuerpo inválido
- **WHEN** se envía un cuerpo que no cumple el DTO
- **THEN** la API responde 400 con la lista de errores en español

#### Scenario: Propiedad no permitida
- **WHEN** se envía `{ "nombre": "Ana", "rol": "admin" }` a un endpoint cuyo DTO no tiene `rol`
- **THEN** la API responde 400 indicando que `rol` no está permitido

### Requirement: Formato de errores
Toda respuesta de error SHALL tener la forma `{ "statusCode": <n>, "error": "<nombre del estado>", "message": "<texto>" | ["<texto>", ...] }`. Los códigos SHALL usarse así: 400 datos inválidos, 401 sin sesión o sesión vencida, 403 sin permiso para el rol, 404 recurso inexistente, 409 conflicto con el estado actual (duplicados, reglas de negocio), 429 demasiadas solicitudes, 500 error inesperado. Un error 500 SHALL NOT exponer detalles internos al cliente y SHALL registrarse en el log.

#### Scenario: Placa duplicada
- **WHEN** se crea un vehículo con una placa ya registrada
- **THEN** la API responde 409 con `message: "La placa ABC123 ya está registrada"`

#### Scenario: Error inesperado
- **WHEN** falla la base de datos durante una petición
- **THEN** la API responde 500 con `message: "Error interno del servidor"` y el detalle queda solo en el log

### Requirement: Seguridad por defecto
Todos los endpoints SHALL requerir un usuario autenticado salvo los marcados explícitamente como públicos (`GET /api/health`, `POST /api/auth/login`). Los endpoints exclusivos del rol `admin` SHALL declararlo explícitamente y responder 403 a otros roles. La API SHALL permitir CORS solo desde `CORS_ORIGIN` y SHALL NOT registrar contraseñas ni tokens.

#### Scenario: Endpoint nuevo sin decorador
- **WHEN** se agrega un endpoint sin marcarlo como público
- **THEN** responde 401 a peticiones sin token

### Requirement: Documentación con Swagger
Cada endpoint SHALL documentarse con los decoradores de `@nestjs/swagger`: `@ApiTags` por módulo, `@ApiOperation` con un resumen en español, las respuestas posibles (`@ApiOkResponse`, `@ApiCreatedResponse`, errores 400/401/403/404/409 que apliquen), `@ApiBearerAuth` en los protegidos y `@ApiProperty` con ejemplo en cada campo de los DTOs. La documentación SHALL publicarse en `/api/docs` y su JSON en `/api/docs-json`.

#### Scenario: Consultar la documentación
- **WHEN** se abre `http://localhost:3000/api/docs`
- **THEN** aparecen todos los endpoints agrupados por módulo, con cuerpos, respuestas, errores y el botón para autenticarse con el token

### Requirement: Configuración tipada
La configuración SHALL leerse solo en `src/config/configuration.ts` a partir de variables de entorno y consumirse con `ConfigService` tipado; el resto del código SHALL NOT leer `process.env`. Cada variable nueva SHALL documentarse en `.env.example` con un valor de ejemplo seguro, y las obligatorias en producción (por ejemplo `JWT_SECRET`) SHALL hacer fallar el arranque si faltan.

#### Scenario: Falta el secreto del JWT en producción
- **WHEN** la API arranca con `NODE_ENV=production` sin `JWT_SECRET`
- **THEN** el arranque falla con un mensaje que nombra la variable faltante

### Requirement: Endpoint de salud
La API SHALL exponer `GET /api/health`, público, que responde `{ "status": "ok", "database": "up" | "down" }` según el estado de la conexión con MongoDB.

#### Scenario: Mongo disponible
- **WHEN** la API está conectada a MongoDB
- **THEN** `GET /api/health` responde 200 con `database: "up"`

#### Scenario: Mongo no disponible
- **WHEN** la conexión con MongoDB está caída
- **THEN** `GET /api/health` responde 200 con `database: "down"`

### Requirement: Pruebas
Cada servicio y controlador SHALL tener pruebas unitarias con Vitest junto al código (`*.spec.ts`), y los flujos HTTP principales pruebas e2e en `test/` (`*.e2e-spec.ts`). `npm test` y `npm run test:e2e` SHALL pasar antes de integrar a `develop`.

#### Scenario: Ejecutar pruebas
- **WHEN** se ejecuta `docker compose exec api npm test`
- **THEN** corren todas las pruebas unitarias y terminan en verde
