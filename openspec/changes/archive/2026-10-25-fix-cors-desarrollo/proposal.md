# Proposal

## Why

En desarrollo, si la app se abría como http://127.0.0.1:5173 o desde el celular con la IP de la computadora, el login respondía 200 pero el navegador bloqueaba la respuesta por CORS (solo se permitía `http://localhost:5173`) y la app no entraba al inicio.

## What Changes

- `CORS_ORIGIN` acepta varios orígenes separados por comas.
- Fuera de producción también se aceptan `localhost`, `127.0.0.1` y las IP de redes locales, en cualquier puerto.

Fuera de alcance: cambiar la política de CORS en producción, que sigue siendo solo `CORS_ORIGIN`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `api-architecture`: orígenes permitidos por CORS.

## Impact

- `src/config/configuration.ts` (`corsOrigins`, `isOrigenPermitido`), `src/main.ts` y `.env.example`.
- El frontend arma la URL de la API con el host de la página (`fix-url-api-por-host`).
