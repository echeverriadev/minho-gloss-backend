# project-conventions Specification

## Purpose
Reglas generales de trabajo de Minho Gloss que aplican por igual al backend y al frontend: desarrollo guiado por specs con OpenSpec, organización de las specs, idioma, costo mínimo, registro de decisiones técnicas y definición de terminado. El flujo de Git está en `git-workflow` y el estilo de código propio de cada repo en `code-style`.

## Requirements

### Requirement: Spec-Driven Development con OpenSpec
Todo cambio de comportamiento SHALL partir de un cambio de OpenSpec en `openspec/changes/<nombre-del-cambio>/` con `proposal.md`, `tasks.md`, los deltas de specs en `specs/` y, cuando haya decisiones técnicas que justificar, `design.md`. El cambio SHALL pasar `openspec validate <nombre>` sin errores antes de escribir código, y el código SHALL seguir su `tasks.md`. Al integrar el pull request, el cambio SHALL archivarse (`openspec archive <nombre>`) para que `openspec/specs/` refleje el comportamiento vigente.

#### Scenario: Implementar una funcionalidad nueva
- **WHEN** se quiere implementar algo que cambia el comportamiento de la app
- **THEN** primero existe un cambio en `openspec/changes/` (por ejemplo creado con `/opsx:propose`) que pasa `openspec validate` sin errores
- **AND** el código se escribe siguiendo su `tasks.md`, marcando cada tarea al terminarla

#### Scenario: Cambio sin impacto en comportamiento
- **WHEN** el cambio es solo de configuración, dependencias o refactor interno
- **THEN** no hace falta un cambio de OpenSpec, salvo que modifique una regla de estas specs (por ejemplo una regla de lint)

### Requirement: Organización de las specs
`openspec/specs/` SHALL contener solo comportamiento vigente o reglas en vigor, una carpeta por capacidad con nombre en `kebab-case` que describa un comportamiento duradero (por ejemplo `clientes`, no `add-clientes`). Los cambios pendientes de implementar SHALL vivir en `openspec/changes/` y nombrarse con un verbo (`add-`, `update-`, `remove-`). Cada spec SHALL tener una sección `## Purpose` y requisitos con al menos un escenario `WHEN`/`THEN`. Los encabezados estructurales y las palabras `SHALL`, `MUST`, `SHOULD` y `MAY` SHALL quedar en inglés; el resto del texto SHALL estar en español. `openspec/README.md` SHALL mantener el mapa de specs y cambios del repo.

La validación SHALL hacerse sin `--strict`: OpenSpec advierte sobre requisitos de más de 500 caracteres y las specs de datos (tablas de campos, de ramas o de endpoints) los superan a propósito. Los requisitos en prosa SHOULD seguir siendo breves y dividirse cuando describan más de un comportamiento.

#### Scenario: Agregar una spec nueva
- **WHEN** un cambio introduce la capacidad de métricas
- **THEN** su delta vive en `openspec/changes/add-metricas/specs/metricas/spec.md`
- **AND** al archivarse se crea `openspec/specs/metricas/spec.md`

### Requirement: Specs compartidas entre repos
Las specs `product-scope`, `domain-model`, `git-workflow` y `project-conventions`, y el archivo `openspec/decisiones-tecnicas.md`, SHALL ser idénticos en los repos `minho-gloss-backend` y `minho-gloss-frontend`. Un cambio en cualquiera de ellos SHALL hacerse en ambos repos, con pull requests que se enlacen entre sí. Las specs propias de cada repo (arquitectura, entorno, estilo de código y módulos) MAY diferir.

#### Scenario: Agregar un campo al cliente
- **WHEN** se agrega un campo a la entidad Cliente
- **THEN** `domain-model` se actualiza igual en los dos repos
- **AND** el pull request de cada repo enlaza al del otro

### Requirement: Idioma
La documentación, las specs, los mensajes de commit, los textos de la interfaz y los mensajes de error para el usuario SHALL estar en español. Los identificadores de código SHALL seguir las reglas de `code-style`: términos del negocio en español (`cliente`, `tipoServicio`) y términos técnicos genéricos en inglés (`create`, `findAll`, `isLoading`). Los comentarios de código SHALL estar en español y explicar el porqué, no el qué.

#### Scenario: Mensaje de error de validación
- **WHEN** la API rechaza un correo inválido
- **THEN** el mensaje que llega al usuario está en español, por ejemplo "El correo no es válido"

### Requirement: Costo mínimo
El proyecto es sin fines de lucro, por lo que SHALL preferir herramientas gratuitas y de código abierto. Cualquier servicio externo, dependencia con licencia restrictiva o plan con límites SHALL justificarse en el `design.md` del cambio que lo introduce, comparando al menos una alternativa gratuita y anotando los límites del plan elegido.

#### Scenario: Elegir un servicio externo
- **WHEN** un cambio necesita un servicio externo (correo, hosting, base de datos)
- **THEN** su `design.md` compara al menos una opción gratuita y deja escritos los límites del plan elegido

### Requirement: Dependencias justificadas
Una dependencia nueva SHALL agregarse solo si resuelve algo que la plataforma o las dependencias existentes no resuelven razonablemente, y su motivo SHALL quedar en el `design.md` del cambio o en la descripción del pull request. Las versiones SHALL fijarse en `package-lock.json`, que siempre se versiona.

#### Scenario: Librería de fechas
- **WHEN** se necesita formatear fechas en `es-ES`
- **THEN** se usa primero `Intl.DateTimeFormat`, y solo se agrega una librería si `Intl` no alcanza

### Requirement: Registro de decisiones técnicas
Las decisiones técnicas transversales (herramientas, proveedores, patrones) y las sugerencias aún no adoptadas SHALL registrarse en `openspec/decisiones-tecnicas.md`, con estado `adoptada`, `pendiente` o `descartada`, el motivo y la fase del roadmap en que aplica. Al adoptarse una sugerencia, SHALL pasar a una spec o al `design.md` del cambio que la implementa.

#### Scenario: Proponer integración continua de despliegue
- **WHEN** alguien sugiere desplegar automáticamente al integrar en `main`
- **THEN** se agrega como `pendiente` en `decisiones-tecnicas.md` con la fase 5 del roadmap

### Requirement: Definición de terminado
Un cambio SHALL considerarse terminado cuando: todas las tareas de su `tasks.md` están marcadas; pasan `npm run check` del repo y la integración continua; hay pruebas para la lógica nueva; los endpoints nuevos están documentados en Swagger (backend) o los componentes compartidos nuevos tienen historia de Storybook (frontend); el pull request fue aprobado e integrado; y el cambio fue archivado en OpenSpec.

#### Scenario: Funcionalidad sin pruebas
- **WHEN** un pull request agrega lógica de negocio sin pruebas
- **THEN** no se considera terminado y no se integra
