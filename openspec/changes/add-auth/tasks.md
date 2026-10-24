# Tasks

## 1. Base y configuración

- [ ] 1.1 Instalar `@nestjs/jwt`, `@nestjs/throttler` y `bcryptjs` dentro del contenedor
- [ ] 1.2 Agregar `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` a `configuration.ts` y `.env.example`, con validación de `JWT_SECRET` en producción
- [ ] 1.3 Definir `ROLES` y el tipo `Rol` en un único archivo compartido

## 2. Usuarios

- [ ] 2.1 Crear `src/modules/usuarios/` con esquema `Usuario` (índice único en `email`, hash de contraseña excluido de las consultas por defecto)
- [ ] 2.2 Implementar `UsuariosService` (create, findAll, findOne, findByEmail, update, remove, restablecerPassword) con la regla de "al menos un admin activo"
- [ ] 2.3 Implementar `UsuariosController` exclusivo de `admin` con DTOs de entrada y `UsuarioResponseDto`
- [ ] 2.4 Crear el primer admin al arrancar cuando la base no tiene usuarios

## 3. Autenticación

- [ ] 3.1 Crear `src/common/auth/` con `@Public()`, `@Roles()`, `@UsuarioActual()`, `JwtAuthGuard` y `RolesGuard`
- [ ] 3.2 Registrar los guards globales con `APP_GUARD` y marcar `GET /api/health` como público
- [ ] 3.3 Implementar `AuthService` y `AuthController` (`login`, `me`, `cambiar-password`)
- [ ] 3.4 Configurar `ThrottlerModule` y aplicar el límite de 5 intentos por minuto a `POST /api/auth/login`

## 4. Documentación

- [ ] 4.1 Documentar en Swagger todos los endpoints de `auth` y `usuarios` con `@ApiBearerAuth`, ejemplos y respuestas 400/401/403/409/429
- [ ] 4.2 Actualizar el README con cómo crear el primer admin

## 5. Pruebas

- [ ] 5.1 Pruebas unitarias de `AuthService` (login correcto, incorrecto, usuario inactivo, cambio de contraseña)
- [ ] 5.2 Pruebas unitarias de `UsuariosService` (correo repetido, último admin, restablecer contraseña)
- [ ] 5.3 Pruebas e2e: login, 401 sin token, 403 de empleado en `/api/usuarios`, 429 al sexto intento
- [ ] 5.4 Ejecutar `npm run check` y dejarlo en verde
