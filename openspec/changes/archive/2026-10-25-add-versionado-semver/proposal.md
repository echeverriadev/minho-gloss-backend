# Proposal

## Why

El dueño pidió publicar un release con todo lo que tiene el proyecto, un changelog en cada repo y usar "SemVer Simplificado" para nombrar las versiones. La spec decía SemVer genérico y no definía cómo numerar antes de la v1 ni dónde registrar los cambios.

## What Changes

- Define SemVer Simplificado: `MAJOR` en 0 hasta completar la v1, `MINOR` por funcionalidades (antes de la v1, igual a la fase del roadmap) y `PATCH` solo para correcciones; sin sufijos.
- Agrega `CHANGELOG.md` en cada repo con formato *Keep a Changelog* en español, usado como notas del release de GitHub.
- Primera versión: `v0.2.0`, cierre de la fase 2.

Fuera de alcance: automatizar el changelog desde los commits y publicar paquetes.

## Capabilities

### New Capabilities

### Modified Capabilities
- `git-workflow`: requisito de versiones y nuevo requisito de registro de cambios.

## Impact

- `CHANGELOG.md` y `version` de `package.json` en ambos repos (`0.2.0`).
- `decisiones-tecnicas.md`: D23.
