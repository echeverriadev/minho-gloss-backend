# Spec Delta

## Purpose
Preferencias del usuario de la sesión y mensajes de la API en su idioma.

## ADDED Requirements

### Requirement: Preferencias del usuario
La respuesta de `POST /api/auth/login` y de `GET /api/auth/me` SHALL incluir `preferencias: { idioma, tema }` del usuario. La API SHALL exponer `PATCH /api/auth/preferencias`, para cualquier usuario autenticado, con `{ idioma?, tema? }` (`idioma`: `es` o `pt-PT`; `tema`: `claro` u `oscuro`), que guarda solo las preferencias propias y responde 200 con las preferencias actualizadas.

#### Scenario: Cambiar a modo oscuro
- **WHEN** un empleado envía `PATCH /api/auth/preferencias` con `{ "tema": "oscuro" }`
- **THEN** la API responde 200 con `{ "idioma": "es", "tema": "oscuro" }` y el próximo login devuelve esas preferencias

#### Scenario: Idioma no soportado
- **WHEN** se envía `{ "idioma": "en" }`
- **THEN** la API responde 400 con el mensaje "El idioma debe ser es o pt-PT"

### Requirement: Mensajes de la API en el idioma del usuario
Cuando la petición trae el encabezado `Accept-Language` con `pt` (por ejemplo `pt-PT`), la API SHALL devolver los mensajes de error y de validación traducidos al portugués de Portugal; en cualquier otro caso SHALL devolverlos en español. Un mensaje sin traducción SHALL devolverse en español.

#### Scenario: Login incorrecto en portugués
- **WHEN** se llama a `POST /api/auth/login` con credenciales incorrectas y `Accept-Language: pt-PT`
- **THEN** la API responde 401 con el mensaje "Email ou palavra-passe incorretos"
