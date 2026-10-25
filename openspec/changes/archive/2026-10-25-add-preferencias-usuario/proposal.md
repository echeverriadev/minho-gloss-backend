# Proposal

## Why

En el negocio de Braga trabajan personas que prefieren leer en portugués de Portugal y otras en español, y algunas usan la app de noche o prefieren una pantalla oscura. El dueño pidió que cada usuario pueda elegir el idioma de toda la app y el modo claro u oscuro.

## What Changes

- Cada usuario guarda `preferencias.idioma` (`es` o `pt-PT`) y `preferencias.tema` (`claro` u `oscuro`).
- `login` y `me` devuelven las preferencias; `PATCH /api/auth/preferencias` las cambia.
- La API traduce sus mensajes de error y validación al portugués cuando recibe `Accept-Language: pt`.

Fuera de alcance: más idiomas, tema "según el sistema" y traducir los datos que escribe el negocio (títulos de servicios, notas).

## Capabilities

### New Capabilities

### Modified Capabilities
- `auth`: preferencias del usuario de la sesión y mensajes en su idioma.
- `domain-model`: campo `preferencias` del usuario.
- `product-scope`: la app puede verse en portugués de Portugal.

## Impact

- `Usuario` (esquema, sesión y respuestas), `AuthController`/`AuthService`.
- Traducciones en `src/common/i18n/` aplicadas en el filtro global de errores.
- El frontend (`add-preferencias-usuario-ui`) consume estos endpoints.
