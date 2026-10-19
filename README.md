# Minho Gloss · Backend

API de gestión del autolavado Minho Gloss: clientes, servicios, métricas y post-venta.

**Stack:** NestJS 12 · TypeScript · MongoDB (Mongoose) · Swagger · Vitest · oxlint · Prettier · OpenSpec

## Requisitos

Solo **Docker** y **Docker Compose** (Docker Desktop en Windows/macOS). No hace falta instalar Node.js ni MongoDB.

## Levantar el entorno

```bash
cp .env.example .env        # opcional, los valores por defecto ya funcionan
docker compose up --build
```

| Qué                        | URL                                     |
| -------------------------- | --------------------------------------- |
| API                        | http://localhost:3000/api               |
| Salud de la API            | http://localhost:3000/api/health        |
| Swagger                    | http://localhost:3000/api/docs          |
| MongoDB (Compass, mongosh) | `mongodb://localhost:27017/minho_gloss` |

Detener: `docker compose down` (los datos de Mongo se conservan). Borrar todo, datos incluidos: `docker compose down -v`.

## Comandos habituales

Todos se ejecutan **dentro del contenedor**:

```bash
docker compose exec api npm test              # pruebas unitarias
docker compose exec api npm run test:e2e      # pruebas e2e
docker compose exec api npm run lint          # oxlint
docker compose exec api npm run format        # Prettier
docker compose exec api npm install <paquete> # nueva dependencia
docker compose exec api npx nest g resource modules/<nombre>  # nuevo módulo
docker compose exec api npx openspec list     # cambios de OpenSpec en curso
```

Si cambia `package.json` en otra rama (por ejemplo tras un `git pull`), actualiza las dependencias del volumen con `docker compose exec api npm install`.

## Estructura

```
src/
  main.ts            # arranque: prefijo /api, CORS, validación y Swagger
  app.module.ts      # módulo raíz: configuración y conexión a Mongo
  config/            # lectura de variables de entorno
  common/            # guards, filtros, interceptores y decoradores compartidos
  modules/           # un módulo por dominio de negocio
    health/          # GET /api/health
test/                # pruebas e2e
openspec/            # especificaciones (SDD)
  specs/             # comportamiento vigente
  changes/           # propuestas de cambio en curso y archivadas
```

## Cómo trabajamos (SDD con OpenSpec)

1. Crea una rama `feature/<nombre>` desde `develop`.
2. Escribe la propuesta del cambio en `openspec/changes/` (con Claude Code: `/opsx:propose "idea"`).
3. Valídala: `docker compose exec api npx openspec validate <cambio>`.
4. Implementa siguiendo su `tasks.md` (`/opsx:apply`).
5. Pasa lint, formato y pruebas, abre el pull request hacia `develop`.
6. Al integrar, archiva el cambio (`/opsx:archive`) para actualizar `openspec/specs/`.

Las reglas completas (Git Flow, commits, nombres, lint) están en [`openspec/specs/project-conventions/spec.md`](openspec/specs/project-conventions/spec.md).

## Producción

```bash
docker build --target prod -t minho-gloss-api .
```
