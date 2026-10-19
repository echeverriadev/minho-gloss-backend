# Tasks

## 1. Configuración y modelo

- [ ] 1.1 Instalar `@nestjs/schedule` y el cliente del proveedor de correo elegido
- [ ] 1.2 Agregar `POST_VENTA_CRON`, `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `NEGOCIO_NOMBRE` y `NEGOCIO_TELEFONO` a `configuration.ts` y `.env.example`
- [ ] 1.3 Crear esquemas `Recordatorio` (índice único parcial por `clienteId` con estado `pendiente`) y `ConfiguracionPostVenta` con valores por defecto
- [ ] 1.4 Implementar `GET` y `PATCH /api/post-venta/configuracion`

## 2. Generación

- [ ] 2.1 Implementar la generación de recordatorios de inactividad y de agradecimiento, idempotente
- [ ] 2.2 Programar el job diario con `@nestjs/schedule` en `APP_TIMEZONE` y exponer `POST /api/post-venta/generar`
- [ ] 2.3 Descartar recordatorios pendientes cuando un cliente retira la autorización o se da de baja

## 3. Contacto

- [ ] 3.1 Renderizar plantillas y construir `enlaceWhatsapp`, `enlaceLlamada` y `enlaceCorreo`
- [ ] 3.2 Implementar `EnviadorCorreo` con proveedores `resend`, `smtp` y `none`
- [ ] 3.3 Implementar listado, `enviar-correo`, `contactado` y `descartar`

## 4. Documentación

- [ ] 4.1 Documentar en Swagger todos los endpoints con respuestas 400/401/403/404/409/503
- [ ] 4.2 Documentar en el README cómo configurar el proveedor de correo gratuito

## 5. Pruebas

- [ ] 5.1 Pruebas unitarias de la generación (inactividad, autorización, días entre contactos, idempotencia, agradecimiento)
- [ ] 5.2 Pruebas unitarias del renderizado de plantillas y de los enlaces (`wa.me` sin `+` y con texto codificado)
- [ ] 5.3 Pruebas del envío de correo con el proveedor simulado (éxito, sin correo, proveedor caído)
- [ ] 5.4 Pruebas e2e: listar pendientes, marcar contactado, 409 al marcar dos veces
- [ ] 5.5 Ejecutar `npm run check` y dejarlo en verde
