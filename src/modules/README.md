# modules

Un módulo de NestJS por dominio de negocio (por ejemplo `auth`, `clientes`, `servicios`, `post-venta`).
Estructura sugerida por módulo:

```
modules/clientes/
  dto/                       # DTOs con class-validator + decoradores de Swagger
  schemas/                   # esquemas de Mongoose
  clientes.controller.ts     # solo HTTP: valida, delega y documenta (Swagger)
  clientes.service.ts        # lógica de negocio
  clientes.module.ts
  *.spec.ts                  # pruebas unitarias junto al código
```

Genera el esqueleto con `docker compose exec api npx nest g resource modules/<nombre>`.
Lo que compartan varios módulos (filtros, guards, decoradores) va en `src/common`.
