# api-architecture Specification

## Purpose
Estructura y reglas técnicas de la API de Minho Gloss (NestJS + MongoDB + Swagger), pensadas para que cada dominio de negocio (autenticación, clientes, servicios, post-venta, métricas) se agregue de forma uniforme.

## Requirements

### Requirement: Organización por módulos de dominio
El código SHALL organizarse en `src/modules/<dominio>/` con un módulo de NestJS por dominio, que contiene su controlador, servicio, DTOs (`dto/`) y esquemas de Mongoose (`schemas/`). El código transversal (guards, filtros, interceptores, decoradores) SHALL ir en `src/common/` y la configuración en `src/config/`. Un módulo SHALL usar otro solo a través de los providers que este exporta.

#### Scenario: Agregar el dominio de clientes
- **WHEN** se implementa la gestión de clientes
- **THEN** se crea `src/modules/clientes/` (por ejemplo con `npx nest g resource modules/clientes`)
- **AND** se registra `ClientesModule` en `AppModule`

### Requirement: Responsabilidades por capa
Los controladores SHALL limitarse a recibir la petición HTTP, validar con DTOs y delegar en servicios. La lógica de negocio SHALL vivir en los servicios y el acceso a datos SHALL hacerse con modelos de Mongoose inyectados en los servicios.

#### Scenario: Regla de negocio nueva
- **WHEN** se agrega una regla, como calcular el precio de un servicio
- **THEN** se implementa en el servicio y se prueba con un test unitario del servicio

### Requirement: Prefijo y documentación de la API
Todas las rutas SHALL colgar del prefijo `/api`. Cada endpoint SHALL documentarse con los decoradores de `@nestjs/swagger` (`@ApiTags`, respuestas y DTOs con `@ApiProperty`), y la documentación SHALL publicarse en `/api/docs`.

#### Scenario: Consultar la documentación
- **WHEN** se abre `http://localhost:3000/api/docs`
- **THEN** aparecen todos los endpoints con sus cuerpos y respuestas

### Requirement: Validación de entrada
La API SHALL validar todos los cuerpos y parámetros con `class-validator` mediante un `ValidationPipe` global con `whitelist` activado, descartando propiedades no declaradas en el DTO.

#### Scenario: Cuerpo inválido
- **WHEN** se envía un cuerpo que no cumple el DTO
- **THEN** la API responde 400 con el detalle de los errores

### Requirement: Endpoint de salud
La API SHALL exponer `GET /api/health`, que responde `{ "status": "ok", "database": "up" | "down" }` según el estado de la conexión con MongoDB.

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
