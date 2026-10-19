# git-workflow Specification

## Purpose
Flujo de trabajo con Git y GitHub para Minho Gloss: ramas (Git Flow), mensajes de commit, pull requests, revisión y versiones. Aplica igual en el repo del backend y en el del frontend.

## Requirements

### Requirement: Ramas permanentes
El repositorio SHALL tener dos ramas permanentes: `main`, que refleja lo que está en producción, y `develop`, donde se integra el trabajo terminado. Nadie SHALL hacer push directo a `main` ni a `develop`; todo cambio entra por pull request.

#### Scenario: Push directo a develop
- **WHEN** alguien intenta hacer `git push origin develop` con commits nuevos
- **THEN** la protección de rama de GitHub lo rechaza y el cambio se sube en una rama propia con su pull request

### Requirement: Ramas de trabajo
Las ramas de trabajo SHALL nombrarse en minúsculas, en `kebab-case` y con uno de estos prefijos:

| Prefijo | Sale de | Se integra en | Uso |
| --- | --- | --- | --- |
| `feature/<descripcion>` | `develop` | `develop` | funcionalidad nueva o cambio de una spec |
| `fix/<descripcion>` | `develop` | `develop` | corrección de un error que aún no está en producción |
| `chore/<descripcion>` | `develop` | `develop` | configuración, dependencias, documentación |
| `release/<x.y.z>` | `develop` | `main` y `develop` | preparar una versión |
| `hotfix/<descripcion>` | `main` | `main` y `develop` | corrección urgente en producción |

Cuando la rama implementa un cambio de OpenSpec, la descripción SHOULD coincidir con el nombre del cambio (por ejemplo `feature/add-clientes`). Las ramas creadas por herramientas automáticas MAY usar su propio prefijo siempre que salgan de `develop` y vuelvan a `develop` por pull request.

#### Scenario: Empezar el módulo de clientes
- **WHEN** se va a implementar el cambio `add-clientes`
- **THEN** se crea `feature/add-clientes` desde la última versión de `develop`

#### Scenario: Error en producción
- **WHEN** hay un error en producción
- **THEN** se crea `hotfix/<descripcion>` desde `main`
- **AND** al terminar se integra en `main`, se etiqueta una versión de parche y se integra también en `develop`

### Requirement: Commits convencionales
Los mensajes de commit SHALL seguir Conventional Commits: `<tipo>(<alcance opcional>): <descripción>`, con la descripción en español, en imperativo o presente, en minúsculas y sin punto final, de hasta 72 caracteres. Los tipos permitidos SHALL ser:

| Tipo | Cuándo |
| --- | --- |
| `feat` | funcionalidad nueva visible para el usuario |
| `fix` | corrección de un error |
| `docs` | solo documentación o specs |
| `style` | formato, sin cambio de lógica |
| `refactor` | cambio interno sin cambio de comportamiento |
| `perf` | mejora de rendimiento |
| `test` | agregar o corregir pruebas |
| `build` | dependencias, Docker, empaquetado |
| `ci` | flujos de integración continua |
| `chore` | tareas varias de mantenimiento |

El alcance SHOULD ser el módulo afectado (`auth`, `clientes`, `servicios`, `metricas`, `post-venta`, `specs`, `lint`, etc.). Un cambio incompatible SHALL marcarse con `!` después del tipo o alcance y explicarse en un pie `BREAKING CHANGE:`.

#### Scenario: Commit de una funcionalidad
- **WHEN** se agrega la búsqueda de clientes por placa
- **THEN** el mensaje es `feat(clientes): agrega búsqueda por placa`

#### Scenario: Cambio incompatible en la API
- **WHEN** se renombra un campo que el frontend usa
- **THEN** el mensaje es del estilo `feat(clientes)!: renombra telefono a celular` con un pie `BREAKING CHANGE:` que explica la migración

### Requirement: Commits pequeños y coherentes
Cada commit SHALL dejar el proyecto compilando y con las pruebas en verde, y SHOULD contener un único cambio lógico. Los commits SHALL NOT incluir secretos, archivos `.env`, carpetas de compilación (`dist/`, `storybook-static/`) ni `node_modules/`.

#### Scenario: Archivo .env agregado por error
- **WHEN** un commit incluye un `.env`
- **THEN** se quita del historial de la rama antes de abrir el pull request y se rotan los secretos que contenía

### Requirement: Pull requests
Todo pull request SHALL:
- Apuntar a `develop`, salvo los de `release/*` y `hotfix/*`, que apuntan a `main`.
- Tener un título con el mismo formato de Conventional Commits.
- Tener una descripción que explique qué cambia y por qué, cómo probarlo, y qué cambio de OpenSpec implementa (si aplica).
- Pasar la integración continua (lint, formato, tipos, pruebas y validación de specs) antes de integrarse.
- Ser revisado y aprobado por el dueño del repositorio antes de integrarse.

Los pull requests hacia `develop` SHALL integrarse con *squash merge*, para que cada funcionalidad quede como un commit convencional. Los de `release/*` y `hotfix/*` hacia `main` SHALL integrarse con *merge commit* para conservar la historia.

#### Scenario: Pull request con la integración continua en rojo
- **WHEN** falla alguno de los chequeos del pull request
- **THEN** no se integra hasta corregirlo con nuevos commits en la misma rama

#### Scenario: Pull request que implementa un cambio de OpenSpec
- **WHEN** el pull request implementa `add-clientes`
- **THEN** su descripción enlaza `openspec/changes/add-clientes/` y todas las tareas de su `tasks.md` están marcadas

### Requirement: Sincronizar la rama con develop
Si `develop` avanza mientras una rama está abierta, la rama SHALL actualizarse integrando `develop` (merge o rebase) y resolviendo conflictos antes de pedir revisión de nuevo. Una rama compartida por varias personas SHALL NOT reescribirse con `push --force`; en una rama propia MAY usarse `push --force-with-lease`.

#### Scenario: Conflicto con develop
- **WHEN** GitHub marca el pull request con conflictos
- **THEN** el autor integra `develop` en su rama, resuelve los conflictos y vuelve a correr los chequeos

### Requirement: Versiones
Las versiones SHALL seguir SemVer (`MAJOR.MINOR.PATCH`) y etiquetarse en `main` como `v<x.y.z>`. El campo `version` de `package.json` SHALL actualizarse en la rama `release/*` o `hotfix/*` correspondiente. Antes de la primera versión estable se SHALL usar `0.y.z`.

#### Scenario: Primera versión para el dueño del negocio
- **WHEN** la v1 está lista en `develop`
- **THEN** se crea `release/0.1.0`, se integra en `main`, se etiqueta `v0.1.0` y se integra de vuelta en `develop`

### Requirement: Coordinación entre repos
Un cambio que afecta el contrato entre backend y frontend (endpoints, campos, códigos de error) SHALL integrarse primero en el backend. El pull request del frontend SHALL enlazar el del backend del que depende.

#### Scenario: Campo nuevo en clientes
- **WHEN** el frontend necesita un campo nuevo del cliente
- **THEN** primero se integra en `develop` del backend el cambio que lo expone
- **AND** después se integra el pull request del frontend que lo usa, con el enlace al del backend
