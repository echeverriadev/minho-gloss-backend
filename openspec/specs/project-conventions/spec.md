# project-conventions Specification

## Purpose
Reglas compartidas de trabajo para el código de Minho Gloss: flujo de ramas (Git Flow), mensajes de commit, estilo de código, lint y formato. Aplican por igual al frontend y al backend para que cualquier persona pueda mantener ambos repos.

## Requirements

### Requirement: Flujo de ramas Git Flow
El repositorio SHALL usar Git Flow simplificado con las ramas `main` (producción) y `develop` (integración). Todo trabajo nuevo SHALL hacerse en ramas `feature/<descripcion-corta>` creadas desde `develop`; las correcciones urgentes en `hotfix/<descripcion>` desde `main`; y las versiones en `release/<x.y.z>` desde `develop`.

#### Scenario: Nueva funcionalidad
- **WHEN** se empieza una funcionalidad nueva
- **THEN** se crea una rama `feature/...` desde `develop`
- **AND** se integra a `develop` mediante un pull request revisado

#### Scenario: Corrección urgente en producción
- **WHEN** hay un error en producción
- **THEN** se crea una rama `hotfix/...` desde `main`
- **AND** al terminar se integra tanto a `main` como a `develop`

#### Scenario: Publicar una versión
- **WHEN** `develop` está lista para salir
- **THEN** se crea `release/x.y.z`, se integra a `main` y se etiqueta `vx.y.z` siguiendo SemVer

### Requirement: Commits convencionales
Los mensajes de commit SHALL seguir Conventional Commits: `<tipo>(<alcance opcional>): <descripción en imperativo>`, con tipos `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build` o `ci`. La descripción MAY escribirse en español.

#### Scenario: Commit de funcionalidad
- **WHEN** se agrega la gestión de clientes
- **THEN** el mensaje es del estilo `feat(clientes): agrega alta de clientes`

### Requirement: Spec-Driven Development con OpenSpec
Todo cambio de comportamiento SHALL partir de una propuesta de cambio en `openspec/changes/` (propuesta, diseño si aplica, tareas y deltas de specs) antes de escribir código. Al terminar e integrar el cambio, SHALL archivarse con `openspec archive` para que `openspec/specs/` refleje el comportamiento vigente. Las decisiones técnicas SHALL quedar documentadas en las specs o en el `design.md` del cambio.

#### Scenario: Implementar una funcionalidad
- **WHEN** se quiere implementar una funcionalidad nueva
- **THEN** primero se crea la propuesta (por ejemplo con `/opsx:propose`) y se valida con `openspec validate`
- **AND** el código se escribe siguiendo `tasks.md` de esa propuesta

### Requirement: Lint y formato obligatorios
El código SHALL pasar `npm run lint` (oxlint) sin errores y `npm run format:check` (Prettier) antes de abrir un pull request. Prettier SHALL usar comillas simples, punto y coma, coma final y ancho de línea 100. La indentación SHALL ser de 2 espacios con finales de línea LF (`.editorconfig`).

#### Scenario: Pull request con código sin formatear
- **WHEN** `npm run format:check` falla
- **THEN** se ejecuta `npm run format` y se vuelve a subir el cambio antes de pedir revisión

### Requirement: Convenciones de nombres
El código SHALL estar en inglés técnico para identificadores genéricos y MAY usar términos del negocio en español (por ejemplo `clientes`, `servicios`). Los archivos de React SHALL usar `PascalCase` para componentes y `camelCase` para el resto; los de NestJS SHALL usar `kebab-case` con sufijo de tipo (`clientes.service.ts`). Tipos, interfaces y clases SHALL usar `PascalCase`; variables y funciones `camelCase`; constantes globales `UPPER_SNAKE_CASE`.

#### Scenario: Nuevo componente de React
- **WHEN** se crea un componente de tarjeta de cliente
- **THEN** el archivo se llama `ClienteCard.tsx` y exporta `ClienteCard`

### Requirement: Costo mínimo
El proyecto es sin fines de lucro, por lo que SHALL preferir herramientas gratuitas y de código abierto, y cualquier servicio de pago o con plan limitado SHALL justificarse en el `design.md` del cambio que lo introduce.

#### Scenario: Elegir un servicio externo
- **WHEN** un cambio necesita un servicio externo (correo, hosting, base de datos)
- **THEN** su `design.md` compara al menos una opción gratuita y justifica la elección
