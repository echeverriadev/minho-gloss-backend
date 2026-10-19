# Design

## Context

El negocio tiene pocos cientos o miles de clientes; en un día normal habrá de cero a algunas decenas de clientes para contactar. Debe costar cero y respetar la autorización de contacto del cliente (Ley 1581 de 2012 de protección de datos en Colombia).

## Goals / Non-Goals

**Goals:**
- Que el dueño abra la app y vea a quién contactar hoy, con el mensaje listo.
- Que nadie reciba mensajes sin haberlo autorizado ni demasiado seguido.

**Non-Goals:**
- Automatizar WhatsApp.

## Decisions

1. **Job diario con `@nestjs/schedule`** a las 9:00 de `APP_TIMEZONE` (`POST_VENTA_CRON`, por defecto `0 9 * * *`). Es idempotente: no crea un recordatorio si el cliente ya tiene uno pendiente o fue contactado en los últimos `diasEntreContactos` días. También se expone `POST /api/post-venta/generar` para ejecutarlo a mano (útil si el hosting gratuito durmió la API a esa hora).
2. **WhatsApp con enlaces `https://wa.me/<telefono sin +>?text=<mensaje>`** que el usuario abre desde el celular. Costo cero. Alternativa: WhatsApp Business Cloud API; descartada porque cobra por conversación y requiere aprobación de plantillas.
3. **Correo con Resend (plan gratuito, 100 correos al día y 3000 al mes)** a través de una interfaz `EnviadorCorreo` con dos implementaciones: `resend` y `smtp` (por ejemplo Gmail con contraseña de aplicación, 500 al día). `EMAIL_PROVIDER=none` (por defecto en desarrollo) desactiva el envío y la app solo ofrece `mailto:`. Alternativas comparadas: Brevo (300 al día gratis), Amazon SES (de pago tras el primer año).
4. **Plantillas con variables simples** `{{nombre}}`, `{{negocio}}`, `{{telefonoNegocio}}`, `{{diasSinVenir}}`, reemplazadas con texto plano (sin HTML de usuarios). Se guardan en la configuración, con valores por defecto en español.
5. **Configuración en un único documento** `ConfiguracionPostVenta` en Mongo, creado con valores por defecto si no existe: `diasInactividad` 30, `diasEntreContactos` 30, `agradecimientoActivo` false, plantillas de WhatsApp y de correo para cada motivo.
6. **Baja de contacto**: cada correo incluye una línea para responder "NO" si no quiere recibir más mensajes; el usuario marca `aceptaContacto: false` en el cliente. Un enlace de baja automático queda como mejora.

## Risks / Trade-offs

- [El hosting gratuito puede estar dormido a la hora del job] → endpoint manual y generación al abrir la pantalla de post-venta si el job no corrió hoy.
- [Límites del plan gratuito de correo] → el envío falla con un mensaje claro y el recordatorio queda pendiente para reintentar o contactar por otro canal.
- [Correos marcados como spam desde un dominio gratuito] → configurar SPF/DKIM del dominio de envío si se usa dominio propio; con Gmail SMTP se envía desde la cuenta del negocio.
