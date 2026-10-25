# Spec Delta

## Purpose
Ajustes de lint y pruebas que surgieron al implementar la autenticación y el primer módulo con base de datos.

## MODIFIED Requirements

### Requirement: Lint con oxlint y chequeo de tipos
El código de `src/` y `test/` SHALL pasar `npm run lint`, que ejecuta oxlint con reglas que usan información de tipos (`--type-aware`), sin errores ni warnings (`--deny-warnings`) y sin comentarios de desactivación sin uso. La configuración vive en `.oxlintrc.json` y SHALL activar:
- Las categorías `correctness` como error, y `suspicious` y `perf` como warning.
- Los plugins `typescript`, `unicorn`, `oxc`, `import`, `promise`, `node` y `vitest`.
- Como error, entre otras: `eqeqeq`, `no-var`, `prefer-const`, `no-console`, `no-param-reassign`, `typescript/no-floating-promises`, `typescript/no-misused-promises`, `typescript/await-thenable`, `typescript/switch-exhaustiveness-check`, `typescript/consistent-type-definitions` (interfaces), `import/no-cycle`, `import/no-duplicates` y `unicorn/filename-case` (`kebab-case`).
- `typescript/consistent-type-imports` SHALL quedar desactivada, porque convertir en `import type` una clase usada en un constructor rompe la inyección de dependencias de NestJS (`emitDecoratorMetadata`).

En las pruebas (`*.spec.ts`, `*.e2e-spec.ts` y `test/`) SHALL desactivarse además `no-underscore-dangle`, `typescript/no-unsafe-type-assertion`, `typescript/no-misused-spread` y `vitest/require-mock-type-parameters`, porque los dobles de prueba de Mongoose y NestJS necesitan `_id`, aserciones de tipo y mocks sin tipar. En `src/` el `_id` de MongoDB SHALL leerse solo con `toId()` de `src/common/mongo/`.

Desactivar una regla en una línea SHALL hacerse con `// oxlint-disable-next-line <regla> -- <motivo>`, siempre con el motivo. Cambiar la configuración de lint SHALL hacerse mediante un pull request que actualice esta spec.

#### Scenario: Promesa sin await
- **WHEN** un servicio llama a una función asíncrona sin `await` ni `void`
- **THEN** `npm run lint` falla con `typescript(no-floating-promises)`

#### Scenario: Doble de prueba de un modelo
- **WHEN** una prueba unitaria simula un modelo de Mongoose con `as unknown as Model<Cliente>`
- **THEN** `npm run lint` no la reporta

#### Scenario: Uso de console.log
- **WHEN** se deja un `console.log` en `src/`
- **THEN** `npm run lint` falla y se reemplaza por el `Logger` de NestJS

### Requirement: Pruebas
Las pruebas SHALL escribirse con Vitest (`describe`/`it` globales) y sus descripciones en español, en presente y describiendo el comportamiento (`it('rechaza un teléfono repetido')`). Cada servicio SHALL tener pruebas unitarias de sus reglas de negocio con los modelos de Mongoose simulados, y cada controlador al menos una prueba e2e del camino feliz y de un error de validación o permiso. Vitest SHALL compilar con SWC (`unplugin-swc`) para emitir la metadata de decoradores que necesitan la inyección de dependencias de NestJS y los esquemas de Mongoose. Las pruebas e2e SHALL levantar la aplicación completa contra una base de MongoDB propia (`minho_gloss_e2e`), con el envío de correos reemplazado por uno en memoria. Las funciones auxiliares de prueba SHALL definirse fuera de los `describe` cuando no capturen variables.

#### Scenario: Regla de precio por tipo de vehículo
- **WHEN** se implementa el cálculo del precio de lista
- **THEN** hay pruebas para un vehículo con precio específico y otro que usa `precioBase`
