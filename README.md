# Minho Gloss · Backend

API de gestión del autolavado Minho Gloss: clientes, servicios, métricas y post-venta.

**Stack:** NestJS 12 · TypeScript · MongoDB (Mongoose) · Swagger · Vitest · oxlint · Prettier · OpenSpec

## Requisitos

Solo **Docker** y **Docker Compose** (Docker Desktop en Windows/macOS). No hace falta instalar Node.js ni MongoDB.

## Levantar el entorno

```bash
cp .env.example .env        # crea el admin inicial y apunta el correo a Mailpit
docker compose up --build
```

| Qué                        | URL                                     |
| -------------------------- | --------------------------------------- |
| API                        | http://localhost:3000/api               |
| Salud de la API            | http://localhost:3000/api/health        |
| Swagger                    | http://localhost:3000/api/docs          |
| MongoDB (Compass, mongosh) | `mongodb://localhost:27017/minho_gloss` |
| Correos de desarrollo      | http://localhost:8025 (Mailpit)         |

### Primer usuario

No hay registro público: las cuentas las crea un admin desde la gestión de usuarios. Al arrancar con la base vacía, la API crea un admin con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env` (en desarrollo `admin@minhogloss.local` / `MinhoGloss2026`). Si ya hay usuarios no toca nada. En producción define esas variables solo para el primer arranque y cambia la contraseña desde el perfil.

### Correos (recuperación de contraseña)

En desarrollo todos los correos van a **Mailpit** y se ven en http://localhost:8025; nada sale a internet. En producción configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM` con un proveedor gratuito (por ejemplo Resend por SMTP); ver `.env.example`.

Detener: `docker compose down` (los datos de Mongo se conservan). Borrar todo, datos incluidos: `docker compose down -v`.

## Comandos habituales

Todos se ejecutan **dentro del contenedor**:

```bash
docker compose exec api npm test              # pruebas unitarias
docker compose exec api npm run test:e2e      # pruebas e2e
docker compose exec api npm run check         # tipos + lint + formato + pruebas + specs
docker compose exec api npm run lint          # oxlint (con chequeo de tipos)
docker compose exec api npm run lint:fix      # corrige lo que oxlint puede
docker compose exec api npm run format        # Prettier
docker compose exec api npm install <paquete> # nueva dependencia
docker compose exec api npx nest g resource modules/<nombre>  # nuevo módulo
docker compose exec api npx openspec list     # cambios de OpenSpec en curso
docker compose exec api npm run specs:validate # valida specs y cambios
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
    health/          # GET /api/health (público)
    auth/            # login, sesión, cambio y recuperación de contraseña
    usuarios/        # cuentas del negocio (solo admin)
    clientes/        # clientes del autolavado
test/                # pruebas e2e
openspec/            # especificaciones (SDD)
  specs/             # comportamiento vigente
  changes/           # propuestas de cambio en curso y archivadas
```

## Cómo trabajamos (SDD con OpenSpec)

1. Crea una rama `feature/<cambio>` desde `develop`.
2. Escribe o elige la propuesta del cambio en `openspec/changes/` (con Claude Code: `/opsx:propose "idea"`). Los módulos de la v1 ya tienen su cambio listo: ver [`openspec/README.md`](openspec/README.md).
3. Valídala: `docker compose exec api npx openspec validate <cambio>`.
4. Implementa siguiendo su `tasks.md` (`/opsx:apply`).
5. Pasa `npm run check`, abre el pull request hacia `develop` y espera la CI en verde.
6. Al integrar, archiva el cambio (`/opsx:archive`) para actualizar `openspec/specs/`.

Reglas completas:

- [`openspec/README.md`](openspec/README.md): mapa de specs, cambios pendientes y contrato de la API.
- [`git-workflow`](openspec/specs/git-workflow/spec.md): ramas, commits y pull requests.
- [`code-style`](openspec/specs/code-style/spec.md): nombres, lint, formato y pruebas.
- [`decisiones-tecnicas.md`](openspec/decisiones-tecnicas.md): decisiones adoptadas y sugerencias pendientes.

## Calidad de código

- **Prettier** formatea todo (`.prettierrc`); **oxlint** revisa el código con reglas de TypeScript, imports, promesas y Vitest, usando información de tipos (`.oxlintrc.json`). Los warnings también hacen fallar.
- La **CI de GitHub Actions** (`.github/workflows/ci.yml`) corre tipos, lint, formato, pruebas, e2e, build y validación de specs en cada pull request.
- En VS Code, instala las extensiones recomendadas (`.vscode/extensions.json`) para formatear al guardar.

## Producción

```bash
docker build --target prod -t minho-gloss-api .
```
