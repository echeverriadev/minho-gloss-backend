# Spec Delta

## Purpose
Versionado con SemVer Simplificado y registro de cambios.

## MODIFIED Requirements

### Requirement: Versiones
Las versiones SHALL seguir **SemVer Simplificado**: `MAJOR.MINOR.PATCH`, etiquetadas en `main` como `v<MAJOR>.<MINOR>.<PATCH>`, donde:

| Parte | Cuándo sube | Ejemplo |
| --- | --- | --- |
| `MAJOR` | `0` mientras la v1 del producto (las seis funcionalidades de `product-scope`) no esté completa; pasa a `1` con la v1 y después solo con cambios incompatibles para quien usa la app o la API | `1.0.0` |
| `MINOR` | cada versión con funcionalidades nuevas; antes de la v1 coincide con la fase del roadmap que se cierra | `0.2.0` = fase 2 |
| `PATCH` | solo correcciones, sin funcionalidades nuevas | `0.2.1` |

Al subir `MINOR` el `PATCH` vuelve a `0`, y al subir `MAJOR` vuelven a `0` los dos. No se usan sufijos (`-beta`, `-rc`). Backend y frontend SHALL publicar juntos la misma versión cuando una entrega los incluye a ambos. El campo `version` de `package.json` SHALL actualizarse en la rama `release/*` o `hotfix/*` correspondiente.

#### Scenario: Primera versión para el dueño del negocio
- **WHEN** la v1 completa está lista en `develop`
- **THEN** se crea `release/1.0.0`, se integra en `main`, se etiqueta `v1.0.0` y se integra de vuelta en `develop`

#### Scenario: Cierre de la fase 2
- **WHEN** termina la fase 2 del roadmap (acceso, clientes, catálogo y preferencias)
- **THEN** se crea `release/0.2.0` en cada repo, se integra en `main` con merge commit, se etiqueta `v0.2.0` y se publica el release en GitHub

#### Scenario: Corrección en producción
- **WHEN** se corrige un error de la versión `0.2.0` sin agregar funcionalidades
- **THEN** la versión siguiente es `0.2.1`

## ADDED Requirements

### Requirement: Registro de cambios
Cada repo SHALL tener un `CHANGELOG.md` en español con el formato de *Keep a Changelog*: una sección `Sin publicar` y una por versión (`## [x.y.z] - AAAA-MM-DD`) con los grupos `Agregado`, `Cambiado`, `Corregido` y `Eliminado` que apliquen, escritos para que el dueño del negocio entienda qué cambió. La rama `release/*` SHALL mover lo de `Sin publicar` a la versión nueva, y el release de GitHub SHALL usar esas mismas notas.

#### Scenario: Preparar una versión
- **WHEN** se crea `release/0.3.0`
- **THEN** el `CHANGELOG.md` de cada repo tiene la sección `[0.3.0]` con la fecha y los cambios de la fase, y el release `v0.3.0` muestra esas notas
