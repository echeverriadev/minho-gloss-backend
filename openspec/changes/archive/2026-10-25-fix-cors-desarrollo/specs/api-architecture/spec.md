# Spec Delta

## Purpose
Orígenes permitidos por CORS en desarrollo y producción.

## MODIFIED Requirements

### Requirement: Seguridad por defecto
Todos los endpoints SHALL requerir un usuario autenticado salvo los marcados explícitamente como públicos (`GET /api/health`, `POST /api/auth/login`). Los endpoints exclusivos del rol `admin` SHALL declararlo explícitamente y responder 403 a otros roles. La API SHALL permitir CORS solo desde los orígenes de `CORS_ORIGIN` (separados por comas) y, fuera de producción, también desde `localhost`, `127.0.0.1` y las IP de redes locales, para probar desde la computadora o el celular y SHALL NOT registrar contraseñas ni tokens.

#### Scenario: Endpoint nuevo sin decorador
- **WHEN** se agrega un endpoint sin marcarlo como público
- **THEN** responde 401 a peticiones sin token

#### Scenario: App abierta desde 127.0.0.1 en desarrollo
- **WHEN** en desarrollo la app abierta en http://127.0.0.1:5173 llama a la API
- **THEN** la API responde con `Access-Control-Allow-Origin: http://127.0.0.1:5173`

#### Scenario: Origen desconocido en producción
- **WHEN** en producción una página de otro dominio llama a la API
- **THEN** el navegador bloquea la respuesta porque el origen no está en `CORS_ORIGIN`
