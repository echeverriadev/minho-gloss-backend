# OpenSpec · Minho Gloss Backend

Mapa de las especificaciones del backend. Las reglas de cómo se usan están en [`specs/project-conventions`](specs/project-conventions/spec.md).

## Specs vigentes (`specs/`)

| Spec | Qué define | Compartida con el frontend |
| --- | --- | --- |
| [`product-scope`](specs/product-scope/spec.md) | Visión, roles, alcance de la v1, fuera de alcance, contexto regional y glosario | Sí |
| [`domain-model`](specs/domain-model/spec.md) | Entidades (Usuario, Cliente, Vehiculo, TipoServicio, ServicioPrestado, Recordatorio), campos y reglas | Sí |
| [`git-workflow`](specs/git-workflow/spec.md) | Git Flow, nombres de ramas, Conventional Commits, pull requests y versiones | Sí |
| [`project-conventions`](specs/project-conventions/spec.md) | SDD con OpenSpec, organización de specs, idioma, costo mínimo, decisiones técnicas, definición de terminado | Sí |
| [`code-style`](specs/code-style/spec.md) | Prettier, oxlint, TypeScript, nombres de archivos y código, errores, pruebas, `npm run check` y CI | No |
| [`api-architecture`](specs/api-architecture/spec.md) | Módulos, capas, rutas REST, paginación, formato de datos y errores, seguridad, Swagger, configuración | No |
| [`dev-environment`](specs/dev-environment/spec.md) | Docker Compose, recarga en caliente, variables de entorno, imagen de producción | No |

Decisiones técnicas y sugerencias pendientes: [`decisiones-tecnicas.md`](decisiones-tecnicas.md) (compartido con el frontend).

## Cambios pendientes (`changes/`)

Orden sugerido de implementación en la fase 2 del roadmap (cada uno depende de los anteriores):

| # | Cambio | Capacidades nuevas | Resumen |
| --- | --- | --- | --- |
| 1 | [`add-auth`](changes/add-auth/proposal.md) | `auth`, `usuarios` | Login con JWT, protección por defecto, roles `admin`/`empleado`, gestión de usuarios y primer admin |
| 2 | [`add-clientes`](changes/add-clientes/proposal.md) | `clientes`, `vehiculos` | CRUD de clientes y vehículos, búsqueda por nombre/teléfono/placa, normalización y duplicados |
| 3 | [`add-catalogo-servicios`](changes/add-catalogo-servicios/proposal.md) | `tipos-servicio` | Tipos de servicio con precio base y por tipo de vehículo |
| 4 | [`add-servicios-prestados`](changes/add-servicios-prestados/proposal.md) | `servicios-prestados` | Registro rápido, listado del día con totales, anulación y contadores del cliente |
| 5 | [`add-metricas`](changes/add-metricas/proposal.md) | `metricas` | Resumen por rango, serie diaria, clientes nuevos/recurrentes e inactivos |
| 6 | [`add-post-venta`](changes/add-post-venta/proposal.md) | `post-venta` | Recordatorios diarios, enlaces de WhatsApp/llamada/correo, envío de correo gratuito |

## Contrato de la API (resumen)

Todas las rutas cuelgan de `/api` y requieren sesión salvo las marcadas como públicas. El detalle de cada una está en la spec del cambio correspondiente y, una vez implementadas, en Swagger (`/api/docs`).

| Método y ruta | Rol | Cambio |
| --- | --- | --- |
| `GET /health` | público | vigente |
| `POST /auth/login` | público | `add-auth` |
| `GET /auth/me` · `POST /auth/cambiar-password` | cualquiera | `add-auth` |
| `GET·POST /usuarios` · `PATCH·DELETE /usuarios/:id` · `POST /usuarios/:id/restablecer-password` | admin | `add-auth` |
| `GET·POST /clientes` · `GET·PATCH /clientes/:id` | cualquiera | `add-clientes` |
| `DELETE /clientes/:id` · `POST /clientes/:id/anonimizar` (RGPD) | admin | `add-clientes` |
| `POST /clientes/:id/vehiculos` · `GET /vehiculos/por-placa/:placa` · `PATCH·DELETE /vehiculos/:id` | cualquiera | `add-clientes` |
| `GET /tipos-servicio` · `GET /tipos-servicio/:id/precio` | cualquiera | `add-catalogo-servicios` |
| `POST /tipos-servicio` · `PATCH·DELETE /tipos-servicio/:id` | admin | `add-catalogo-servicios` |
| `GET·POST /servicios-prestados` · `GET·PATCH /servicios-prestados/:id` | cualquiera (con reglas por fecha) | `add-servicios-prestados` |
| `POST /servicios-prestados/:id/anular` | admin | `add-servicios-prestados` |
| `GET /metricas/resumen` · `GET /metricas/serie-diaria` · `GET /metricas/clientes-inactivos` | admin | `add-metricas` |
| `GET·PATCH /post-venta/configuracion` · `POST /post-venta/generar` | admin | `add-post-venta` |
| `GET /post-venta/recordatorios` · `POST /post-venta/recordatorios/:id/{enviar-correo,contactado,descartar}` | cualquiera | `add-post-venta` |

## Flujo de trabajo

```bash
docker compose exec api npx openspec list                 # cambios en curso
docker compose exec api npx openspec show add-clientes    # ver un cambio
docker compose exec api npm run specs:validate            # validar specs y cambios
docker compose exec api npx openspec archive add-clientes # al integrar el PR
```

Con Claude Code: `/opsx:propose`, `/opsx:apply <cambio>`, `/opsx:archive <cambio>`.
