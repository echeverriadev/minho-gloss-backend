# dev-environment Specification

## Purpose
Entorno de desarrollo del backend que corre completamente en Docker, para que nadie tenga que instalar Node.js, MongoDB ni otras herramientas en su máquina.

## Requirements

### Requirement: Arranque con un solo comando
El entorno SHALL levantarse con `docker compose up` usando únicamente Docker y Docker Compose instalados en la máquina. El servicio `api` SHALL usar la imagen `node:24-alpine` (Node.js LTS) y el servicio `mongo` la imagen `mongo:8`.

#### Scenario: Primer arranque
- **WHEN** se clona el repo y se ejecuta `docker compose up --build`
- **THEN** la API responde en `http://localhost:3000/api/health`
- **AND** la documentación Swagger está en `http://localhost:3000/api/docs`

### Requirement: Recarga en caliente
El código fuente SHALL montarse en el contenedor y NestJS SHALL correr en modo watch, de modo que un cambio en `src/` reinicie la API sin reconstruir la imagen. `node_modules` SHALL vivir en un volumen de Docker, no en la máquina local.

#### Scenario: Editar un archivo
- **WHEN** se guarda un cambio en `src/`
- **THEN** la API se reinicia sola dentro del contenedor

### Requirement: Comandos de Node dentro del contenedor
Todos los comandos de npm y Nest (instalar paquetes, tests, lint, OpenSpec) SHALL ejecutarse dentro del contenedor con `docker compose exec api <comando>` o `docker compose run --rm api <comando>`.

#### Scenario: Instalar una dependencia
- **WHEN** se necesita un paquete nuevo
- **THEN** se ejecuta `docker compose exec api npm install <paquete>`
- **AND** `package.json` y `package-lock.json` se actualizan en el repo

### Requirement: Datos persistentes de Mongo
Los datos de MongoDB SHALL guardarse en el volumen `mongo_data` y sobrevivir a `docker compose down`. Solo `docker compose down -v` SHALL borrarlos.

#### Scenario: Reiniciar el entorno
- **WHEN** se ejecuta `docker compose down` y luego `docker compose up`
- **THEN** los datos cargados previamente siguen en la base

### Requirement: Configuración por variables de entorno
La configuración SHALL leerse de variables de entorno (`PORT`, `MONGO_URI`, `CORS_ORIGIN`), documentadas en `.env.example`. El archivo `.env` SHALL ser opcional y nunca versionarse.

#### Scenario: Cambiar el origen permitido por CORS
- **WHEN** el frontend corre en otro puerto
- **THEN** se define `CORS_ORIGIN` en `.env` y se reinicia `api`

### Requirement: Imagen de producción
El `Dockerfile` SHALL tener una etapa `prod` que compile TypeScript y ejecute `node dist/main` como usuario sin privilegios, sin dependencias de desarrollo.

#### Scenario: Construir para producción
- **WHEN** se ejecuta `docker build --target prod -t minho-gloss-api .`
- **THEN** se obtiene una imagen que arranca la API compilada
