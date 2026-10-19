# Proposal

## Why

El negocio quiere recordarles a sus clientes que siempre está a la orden, por correo y por teléfono, para que vuelvan. Hacerlo a mano exige revisar quién no ha vuelto; la app puede preparar esa lista cada día y dejar el contacto a uno o dos toques, sin pagar por servicios de mensajería.

## What Changes

- Job diario que genera recordatorios `pendiente` para clientes que autorizaron contacto y no vuelven hace N días (por defecto 30), sin repetir a quien ya se contactó recientemente.
- Recordatorio opcional de agradecimiento al día siguiente de un servicio (desactivado por defecto).
- Listado de recordatorios con los datos de contacto y los enlaces listos: `wa.me` con mensaje prellenado, `tel:` y `mailto:`.
- Envío de correo desde la API con un proveedor gratuito configurable; si no está configurado, el correo también se envía a mano.
- Marcar recordatorios como contactados (con canal) o descartados.
- Configuración de la post-venta (días de inactividad, días entre contactos, plantillas de mensajes) editable por el admin.

Fuera de alcance: envío automático de WhatsApp o SMS por API de pago, campañas masivas, encuestas de satisfacción y seguimiento de aperturas de correo.

## Capabilities

### New Capabilities
- `post-venta`: recordatorios periódicos para que los clientes vuelvan y registro de cada contacto.

### Modified Capabilities

## Impact

- Código nuevo: `src/modules/post-venta/` con esquemas `Recordatorio` y `ConfiguracionPostVenta`.
- Dependencias nuevas: `@nestjs/schedule` y el SDK o cliente SMTP del proveedor de correo elegido (ver `design.md`).
- Variables de entorno nuevas: `POST_VENTA_CRON`, `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY` o `SMTP_*`, `NEGOCIO_NOMBRE`, `NEGOCIO_TELEFONO`.
- Depende de `add-clientes` y `add-servicios-prestados`. El frontend (`add-post-venta-ui`) consume estos endpoints.
