# Spec Delta

## Purpose
Bandeja de correo local para probar la recuperación de contraseña sin enviar correos reales.

## ADDED Requirements

### Requirement: Correo de desarrollo con Mailpit
`docker compose` SHALL levantar el servicio `mailpit` (imagen `axllent/mailpit`), que recibe por SMTP en el puerto 1025 todos los correos que envía la API y los muestra en http://localhost:8025 sin entregarlos a internet. En desarrollo la API SHALL apuntar a ese servicio con `SMTP_HOST=mailpit` y `SMTP_PORT=1025`.

#### Scenario: Probar la recuperación de contraseña
- **WHEN** se pide recuperar la contraseña desde la app en desarrollo
- **THEN** el correo con el enlace aparece en http://localhost:8025

### Requirement: Administrador inicial en desarrollo
`.env.example` SHALL traer `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` con valores de desarrollo, para que al copiarlo a `.env` y levantar el entorno con la base vacía exista un admin con el que iniciar sesión.

#### Scenario: Primer arranque del entorno
- **WHEN** se copia `.env.example` a `.env` y se ejecuta `docker compose up` con la base vacía
- **THEN** se puede iniciar sesión con el correo y la contraseña de `ADMIN_EMAIL` y `ADMIN_PASSWORD`
