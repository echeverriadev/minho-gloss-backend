# Tasks

## 1. Base y configuración

- [x] 1.1 Instalar `@nestjs/jwt`, `@nestjs/throttler`, `bcryptjs` y `nodemailer` dentro del contenedor
- [x] 1.2 Agregar las variables de JWT, admin inicial, recuperación de contraseña y SMTP a `configuration.ts` y `.env.example`, con validación de `JWT_SECRET` en producción
- [x] 1.3 Definir `ROLES` y el tipo `Rol` en un único archivo compartido
- [x] 1.4 Crear el filtro global de errores con el formato de `api-architecture` y mensajes en español
- [x] 1.5 Agregar el servicio `mailpit` a `docker-compose.yml` y crear `MailService` en `src/common/mail/`

## 2. Usuarios

- [x] 2.1 Crear `src/modules/usuarios/` con esquema `Usuario` (índice único en `email`, hash de contraseña y token de recuperación excluidos de las consultas por defecto)
- [x] 2.2 Implementar `UsuariosService` (create, findAll, findOne, findByEmail, update, remove, restablecerPassword) con la regla de "al menos un admin activo"
- [x] 2.3 Implementar `UsuariosController` exclusivo de `admin` con DTOs de entrada y `UsuarioResponseDto`
- [x] 2.4 Crear el primer admin al arrancar cuando la base no tiene usuarios

## 3. Autenticación

- [x] 3.1 Crear `src/common/auth/` con `@Public()`, `@Roles()`, `@UsuarioActual()`, `JwtAuthGuard` y `RolesGuard`
- [x] 3.2 Registrar los guards globales con `APP_GUARD` y marcar `GET /api/health` como público
- [x] 3.3 Implementar `AuthService` y `AuthController` (`login`, `me`, `cambiar-password`)
- [x] 3.4 Implementar `recuperar-password` y `restablecer-password` con token de un solo uso y correo
- [x] 3.5 Configurar `ThrottlerModule` y aplicar los límites a `login` y `recuperar-password`

## 4. Documentación

- [x] 4.1 Documentar en Swagger todos los endpoints de `auth` y `usuarios` con `@ApiBearerAuth`, ejemplos y respuestas 400/401/403/409/429
- [x] 4.2 Actualizar el README con el admin inicial y cómo ver los correos en Mailpit

## 5. Pruebas

- [x] 5.1 Pruebas unitarias de `AuthService` (login correcto, incorrecto, usuario inactivo, cambio de contraseña, recuperación)
- [x] 5.2 Pruebas unitarias de `UsuariosService` (correo repetido, último admin, restablecer contraseña)
- [x] 5.3 Pruebas e2e: login, 401 sin token, 403 de empleado en `/api/usuarios`, recuperación completa, 429 al sexto intento
- [x] 5.4 Ejecutar `npm run check` y dejarlo en verde
