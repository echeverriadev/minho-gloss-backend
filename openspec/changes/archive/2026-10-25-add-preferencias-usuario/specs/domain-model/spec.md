# Spec Delta

## Purpose
Preferencias de idioma y tema de cada usuario.

## MODIFIED Requirements

### Requirement: Entidad Usuario
Un `Usuario` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, 2 a 80 caracteres |
| `email` | texto | obligatorio, formato de correo, único, se guarda en minúsculas |
| `password` | texto | solo de entrada; mínimo 8 caracteres; se guarda únicamente su hash y nunca se devuelve |
| `rol` | `admin` \| `empleado` | obligatorio |
| `activo` | booleano | por defecto `true`; un usuario inactivo no puede iniciar sesión |
| `preferencias.idioma` | `es` \| `pt-PT` | por defecto `es`; idioma en que el usuario ve la app y los mensajes de la API |
| `preferencias.tema` | `claro` \| `oscuro` | por defecto `claro`; apariencia de la app |

SHALL existir siempre al menos un usuario `admin` activo.

#### Scenario: Desactivar al último admin
- **WHEN** se intenta desactivar o cambiar de rol al único admin activo
- **THEN** la operación se rechaza con un error de conflicto

#### Scenario: Usuario que prefiere portugués
- **WHEN** un usuario guarda `preferencias.idioma` = `pt-PT`
- **THEN** la próxima vez que inicia sesión, en cualquier dispositivo, ve la app en portugués de Portugal
