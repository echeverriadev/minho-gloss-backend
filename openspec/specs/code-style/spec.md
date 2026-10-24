# code-style Specification

## Purpose
Convenciones de código del backend de Minho Gloss (NestJS + TypeScript): nombres, estructura de archivos, estilo de TypeScript, lint, formato, pruebas e integración continua. Su objetivo es que todo el código se lea como si lo hubiera escrito una sola persona.

## Requirements

### Requirement: Formato automático con Prettier
Todo el código, la configuración JSON/YAML y la documentación fuera de `openspec/` SHALL formatearse con Prettier usando `.prettierrc`: comillas simples, punto y coma, coma final en todo (`trailingComma: all`) y ancho de línea 100. La indentación SHALL ser de 2 espacios, con codificación UTF-8, finales de línea LF y salto de línea final, según `.editorconfig`. `npm run format:check` SHALL pasar sin cambios antes de abrir un pull request.

#### Scenario: Archivo sin formatear
- **WHEN** `npm run format:check` reporta un archivo
- **THEN** se ejecuta `docker compose exec api npm run format` y se sube el resultado

### Requirement: Lint con oxlint y chequeo de tipos
El código de `src/` y `test/` SHALL pasar `npm run lint`, que ejecuta oxlint con reglas que usan información de tipos (`--type-aware`), sin errores ni warnings (`--deny-warnings`) y sin comentarios de desactivación sin uso. La configuración vive en `.oxlintrc.json` y SHALL activar:
- Las categorías `correctness` como error, y `suspicious` y `perf` como warning.
- Los plugins `typescript`, `unicorn`, `oxc`, `import`, `promise`, `node` y `vitest`.
- Como error, entre otras: `eqeqeq`, `no-var`, `prefer-const`, `no-console`, `no-param-reassign`, `typescript/no-floating-promises`, `typescript/no-misused-promises`, `typescript/await-thenable`, `typescript/switch-exhaustiveness-check`, `typescript/consistent-type-definitions` (interfaces), `import/no-cycle`, `import/no-duplicates` y `unicorn/filename-case` (`kebab-case`).
- `typescript/consistent-type-imports` SHALL quedar desactivada, porque convertir en `import type` una clase usada en un constructor rompe la inyección de dependencias de NestJS (`emitDecoratorMetadata`).

Desactivar una regla en una línea SHALL hacerse con `// oxlint-disable-next-line <regla> -- <motivo>`, siempre con el motivo. Cambiar la configuración de lint SHALL hacerse mediante un pull request que actualice esta spec.

#### Scenario: Promesa sin await
- **WHEN** un servicio llama a una función asíncrona sin `await` ni `void`
- **THEN** `npm run lint` falla con `typescript(no-floating-promises)`

#### Scenario: Uso de console.log
- **WHEN** se deja un `console.log` en `src/`
- **THEN** `npm run lint` falla y se reemplaza por el `Logger` de NestJS

### Requirement: Chequeo de tipos estricto
El proyecto SHALL compilar con `strict: true` y `npm run typecheck` SHALL pasar sin errores. El código SHALL NOT usar `any` salvo en pruebas o con un comentario que justifique por qué; para datos desconocidos SHALL usarse `unknown` y validarse. Las aserciones no nulas (`!`) SHOULD evitarse fuera de las pruebas.

#### Scenario: Respuesta de una librería sin tipos
- **WHEN** una librería devuelve un valor sin tipar
- **THEN** se tipa como `unknown` y se valida antes de usarlo, en lugar de usar `any`

### Requirement: Nombres de archivos y carpetas
Los archivos y carpetas SHALL nombrarse en `kebab-case`, con el sufijo del tipo de pieza de NestJS:

| Pieza | Archivo | Clase |
| --- | --- | --- |
| Módulo | `clientes.module.ts` | `ClientesModule` |
| Controlador | `clientes.controller.ts` | `ClientesController` |
| Servicio | `clientes.service.ts` | `ClientesService` |
| Esquema de Mongoose | `schemas/cliente.schema.ts` | `Cliente` y `ClienteSchema` |
| DTO de entrada | `dto/create-cliente.dto.ts`, `dto/update-cliente.dto.ts`, `dto/query-clientes.dto.ts` | `CreateClienteDto`, `UpdateClienteDto`, `QueryClientesDto` |
| DTO de respuesta | `dto/cliente-response.dto.ts` | `ClienteResponseDto` |
| Guard, pipe, filtro, interceptor, decorador | `roles.guard.ts`, `parse-object-id.pipe.ts`, `http-exception.filter.ts`, `roles.decorator.ts` | `RolesGuard`, `ParseObjectIdPipe`, ... |
| Prueba unitaria | `clientes.service.spec.ts` (junto al archivo) | — |
| Prueba e2e | `test/clientes.e2e-spec.ts` | — |

Las carpetas de módulo SHALL usar el nombre del dominio en plural (`clientes`, `vehiculos`, `tipos-servicio`, `servicios-prestados`, `metricas`, `post-venta`, `usuarios`, `auth`).

#### Scenario: Nuevo módulo de vehículos
- **WHEN** se crea el módulo de vehículos
- **THEN** sus archivos son `src/modules/vehiculos/vehiculos.module.ts`, `vehiculos.controller.ts`, `vehiculos.service.ts`, `schemas/vehiculo.schema.ts` y `dto/create-vehiculo.dto.ts`

### Requirement: Nombres en el código
Clases, interfaces, tipos y enums SHALL usar `PascalCase`; variables, funciones, métodos y propiedades `camelCase`; constantes de módulo inmutables `UPPER_SNAKE_CASE`; valores de enums y uniones de texto en minúsculas (`'admin'`, `'efectivo'`). Los conceptos del negocio SHALL nombrarse en español sin tildes ni `ñ` (`cliente`, `tipoServicio`, `anio`), y los conceptos técnicos en inglés (`findAll`, `isActive`, `createdAt`, `accessToken`). Los métodos de servicios SHALL usar los verbos de NestJS: `create`, `findAll`, `findOne`, `update`, `remove`, y nombres descriptivos para lo demás (`anular`, `findByPlaca`). Los booleanos SHALL leerse como pregunta (`activo`, `aceptaContacto`, `isPublic`). Las interfaces SHALL NOT llevar prefijo `I`.

#### Scenario: Método para anular un servicio
- **WHEN** se agrega la anulación de un servicio prestado
- **THEN** el método es `ServiciosPrestadosService.anular(id, motivo, usuario)`

### Requirement: Imports y módulos ESM
El proyecto SHALL ser ESM (`"type": "module"`). Los imports relativos SHALL incluir la extensión `.js` (`./clientes.service.js`). Los módulos de Node SHALL importarse con el prefijo `node:` (`node:crypto`). Un archivo SHALL NOT exportar por defecto, salvo los de configuración que lo requieran (`src/config/configuration.ts`). Un módulo de dominio SHALL importar de otro solo lo que este exporta en su `*.module.ts`, nunca sus archivos internos directamente, y SHALL NOT haber dependencias circulares.

#### Scenario: Servicios prestados necesita datos del cliente
- **WHEN** `ServiciosPrestadosService` necesita actualizar `ultimoServicioEn` del cliente
- **THEN** inyecta `ClientesService`, exportado por `ClientesModule`, en lugar de usar el modelo de Mongoose de clientes directamente

### Requirement: Estilo de TypeScript
El código SHALL preferir `const`, funciones puras y `async`/`await` en lugar de `.then()`. Las propiedades inyectadas SHALL declararse `private readonly`. Los tipos de entrada y salida de cada método público de un servicio SHALL ser explícitos. Las uniones de texto (`'admin' | 'empleado'`) SHALL preferirse a `enum` de TypeScript, definidas una vez como arreglo `as const` y reutilizadas en DTOs y esquemas. Los `switch` sobre uniones SHALL ser exhaustivos.

#### Scenario: Roles de usuario
- **WHEN** se necesitan los roles en un DTO y en un esquema
- **THEN** se define `export const ROLES = ['admin', 'empleado'] as const` y `export type Rol = (typeof ROLES)[number]` en un único archivo y ambos lo importan

### Requirement: Manejo de errores y logs
Los errores esperados SHALL lanzarse con las excepciones HTTP de NestJS (`NotFoundException`, `ConflictException`, `BadRequestException`, `ForbiddenException`) y un mensaje en español. Los servicios SHALL NOT capturar errores para ocultarlos. Los logs SHALL escribirse con `Logger` de NestJS con el nombre de la clase como contexto, y SHALL NOT incluir contraseñas, tokens ni datos personales completos.

#### Scenario: Cliente inexistente
- **WHEN** se pide un cliente que no existe
- **THEN** el servicio lanza `NotFoundException('Cliente no encontrado')`

### Requirement: Comentarios y documentación del código
Los comentarios SHALL estar en español y explicar el porqué de una decisión no evidente; SHALL NOT repetir lo que el código ya dice. La documentación de los endpoints SHALL hacerse con los decoradores de Swagger, no con comentarios. Un `TODO` SHALL referenciar un cambio de OpenSpec o una sugerencia de `decisiones-tecnicas.md`.

#### Scenario: Regla de negocio no obvia
- **WHEN** el código excluye los servicios anulados de un cálculo
- **THEN** un comentario breve indica la regla de `domain-model` que lo exige

### Requirement: Pruebas
Las pruebas SHALL escribirse con Vitest (`describe`/`it` globales) y sus descripciones en español, en presente y describiendo el comportamiento (`it('rechaza un teléfono repetido')`). Cada servicio SHALL tener pruebas unitarias de sus reglas de negocio con los modelos de Mongoose simulados, y cada controlador al menos una prueba e2e del camino feliz y de un error de validación o permiso. Las funciones auxiliares de prueba SHALL definirse fuera de los `describe` cuando no capturen variables.

#### Scenario: Regla de precio por tipo de vehículo
- **WHEN** se implementa el cálculo del precio de lista
- **THEN** hay pruebas para un vehículo con precio específico y otro que usa `precioBase`

### Requirement: Comando de verificación completa
`npm run check` SHALL ejecutar, en este orden, chequeo de tipos, lint, formato, pruebas unitarias y validación de las specs de OpenSpec, y SHALL pasar antes de abrir un pull request. `npm run lint:fix` y `npm run format` SHALL usarse para corregir automáticamente lo que se pueda.

#### Scenario: Antes de pedir revisión
- **WHEN** se termina una tarea
- **THEN** se ejecuta `docker compose exec api npm run check` y termina sin errores

### Requirement: Integración continua
Cada pull request hacia `develop` o `main`, y cada push a esas ramas, SHALL ejecutar en GitHub Actions con Node.js 24: `npm ci`, chequeo de tipos, lint, formato, pruebas unitarias, pruebas e2e, build y `openspec validate --all`. Un pull request con algún paso en rojo SHALL NOT integrarse.

#### Scenario: Pull request con una spec inválida
- **WHEN** un cambio de OpenSpec no tiene escenarios en un requisito
- **THEN** el paso "Specs de OpenSpec" de la integración continua falla

### Requirement: Editor recomendado
El repo SHALL incluir `.vscode/extensions.json` con las extensiones de oxc, Prettier y EditorConfig, y `.vscode/settings.json` con formato al guardar y correcciones de oxlint, para que el editor aplique las mismas reglas que la integración continua.

#### Scenario: Abrir el repo en VS Code
- **WHEN** se abre el repo por primera vez en VS Code
- **THEN** el editor sugiere instalar las extensiones recomendadas y formatea al guardar
