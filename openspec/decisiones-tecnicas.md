# Decisiones técnicas y sugerencias

Registro de decisiones técnicas transversales de Minho Gloss y de sugerencias todavía no adoptadas. Este archivo es idéntico en `minho-gloss-backend` y `minho-gloss-frontend` (ver la spec `project-conventions`).

Estados: **adoptada** (vigente), **pendiente** (sugerida, sin decidir o para una fase futura), **descartada** (evaluada y rechazada, con el motivo).

Fases del roadmap: 0 entorno · 1 specs y convenciones · 2 backend · 3 frontend · 4 post-venta · 5 despliegue.

## Decisiones adoptadas

| # | Decisión | Motivo | Fase |
| --- | --- | --- | --- |
| D1 | Dos repos separados (backend y frontend) con Docker Compose en cada uno | Cada parte se despliega por separado y en lugares gratuitos distintos; nadie necesita Node ni Mongo instalados | 0 |
| D2 | Node.js 24 LTS en Docker y en la integración continua | Versión LTS vigente; la misma en local y en CI evita diferencias de `npm ci` | 0 |
| D3 | OpenSpec 1.14 como herramienta de SDD, specs en español | Pedido explícito del proyecto | 0 |
| D4 | **oxlint** como linter en lugar de ESLint, con chequeo de tipos (`--type-aware`) | Es el linter por defecto de NestJS 12 y Vite 8, implementa las reglas de ESLint, typescript-eslint, React, import, unicorn y jsx-a11y que usamos, corre en milisegundos y necesita un solo archivo de configuración. Si alguna regla imprescindible faltara, se puede sumar ESLint solo para esa regla | 1 |
| D5 | Prettier para el formato, con comillas simples, punto y coma, coma final y ancho 100; en el frontend con el plugin de Tailwind para ordenar clases | Un único formato sin discusiones; el plugin evita diffs por orden de clases | 0 y 1 |
| D6 | Los warnings de lint fallan la integración continua (`--deny-warnings`) | Evita que se acumulen warnings ignorados; si una regla no aplica en un caso, se desactiva en esa línea con un comentario que diga por qué | 1 |
| D7 | Integración continua con GitHub Actions (lint, formato, tipos, pruebas, build y validación de specs) | Gratis para repos de GitHub; protege `develop` y `main` | 1 |
| D8 | Sin hooks de Git locales (Husky, lint-staged) por ahora | Los hooks corren en la máquina, que no tiene Node instalado (todo vive en Docker); la CI cumple ese rol | 1 |
| D9 | Montos como enteros en céntimos de euro (EUR) y fechas en UTC con zona de negocio `Europe/Lisbon` (negocio en Braga) | Evita errores de redondeo y de cambio de día en las métricas | 1 |
| D10 | Baja lógica (`activo: false`) en lugar de borrado físico | Conserva el historial y las métricas | 1 |
| D11 | Autenticación con JWT de acceso (sin refresh token en la v1) y contraseñas con hash | Simple para un solo negocio con pocos usuarios; el detalle está en el `design.md` de `add-auth` | 1 |
| D12 | Validación con `class-validator` en el backend y reglas de React Hook Form en el frontend | Es lo que traen NestJS y React Hook Form; ver S1 para unificarlas | 1 |
| D13 | WhatsApp de post-venta con enlaces `wa.me` que abre el usuario, sin API de pago | Costo cero; la API oficial de WhatsApp Business cobra por conversación | 1 |
| D14 | Los términos del negocio en español en el código y las rutas (`/api/clientes`) | Coinciden con el lenguaje del dueño y las specs; los términos técnicos quedan en inglés | 1 |
| D15 | Negocio en Braga (Portugal): euros en céntimos, zona `Europe/Lisbon`, prefijo `+351`, RGPD (consentimiento de contacto y derecho de supresión) e interfaz en español con formato `es-ES` | Datos confirmados por el dueño del proyecto | 1 |

## Sugerencias pendientes

| # | Sugerencia | Por qué | Costo | Fase |
| --- | --- | --- | --- | --- |
| S1 | Esquemas compartidos con Zod (un paquete común o copia validada en CI) para no duplicar reglas entre backend y frontend | Hoy las reglas de validación están dos veces (DTOs y formularios) | Gratis; agrega una dependencia en cada repo | 2 o 3 |
| S2 | Respaldo periódico de Mongo: `mongodump` programado con GitHub Actions hacia un almacenamiento gratuito | El plan M0 de Atlas no incluye respaldos ni restauración a un punto en el tiempo | Gratis con límites de Actions | 5 |
| S3 | Desplegar el frontend en Cloudflare Pages (o Netlify) | Hosting estático gratuito con HTTPS | Gratis | 5 |
| S4 | Desplegar el backend en Render, Railway, Fly.io u Oracle Cloud Always Free | Comparar: los planes gratuitos de Render duermen el servicio; Oracle Always Free no duerme pero requiere administrar una VM | Gratis o pocos dólares | 5 |
| S5 | Correo transaccional con el plan gratuito de Resend (alternativas: Brevo, Gmail SMTP con contraseña de aplicación) | Envío de recordatorios de post-venta | Gratis dentro de los límites diarios | 4 |
| S6 | Revisar los títulos de los pull requests con Conventional Commits en la CI | Refuerza `git-workflow` sin hooks locales | Gratis | 2 |
| S7 | Dependabot o Renovate para actualizar dependencias | Mantiene seguras las dependencias con poco esfuerzo | Gratis | 2 |
| S8 | Pruebas de componentes con Vitest + Testing Library y pruebas de Storybook (`@storybook/addon-vitest`) en el frontend | Hoy el frontend solo tiene lint, tipos y build | Gratis | 3 |
| S9 | Logs estructurados en JSON (por ejemplo `nestjs-pino`) en producción | Facilita leer logs en el hosting gratuito | Gratis | 5 |
| S10 | Instalar la app como PWA (manifest e ícono) para abrirla como una app en el celular | Uso diario desde el celular del patio | Gratis | 3 |
| S11 | Protección de ramas en GitHub para `main` y `develop` (pull request obligatorio y CI en verde) | `git-workflow` lo exige; se configura a mano en GitHub | Gratis | 1 |
| S12 | Exportar clientes y servicios a CSV desde la app | El dueño puede querer llevarse sus datos a una hoja de cálculo | Gratis | después de la v1 |
| S13 | Traducir la interfaz al portugués (`pt-PT`) además del español | El negocio está en Braga y puede tener empleados o clientes que prefieran portugués | Gratis; requiere extraer los textos a archivos de traducción | después de la v1 |

## Sugerencias descartadas

| # | Sugerencia | Motivo |
| --- | --- | --- |
| X1 | Monorepo con un solo `package.json` (Nx, Turborepo) | Agrega herramientas y complejidad para dos proyectos pequeños que se despliegan por separado |
| X2 | Biome en lugar de oxlint + Prettier | Válido, pero oxlint ya viene por defecto con NestJS 12 y Vite 8 y Prettier tiene el plugin de Tailwind |
| X3 | Envío automático de WhatsApp por API | Costo por mensaje; contradice el costo mínimo (ver D13) |
