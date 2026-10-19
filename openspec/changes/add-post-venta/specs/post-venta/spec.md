# Spec Delta

## Purpose
Post-venta del autolavado: generar cada día los recordatorios para los clientes que autorizaron contacto, facilitar el contacto por correo, WhatsApp o llamada y registrar el resultado.

## ADDED Requirements

### Requirement: Configuración de la post-venta
La API SHALL exponer `GET /api/post-venta/configuracion` y `PATCH /api/post-venta/configuracion`, exclusivos de `admin`, con `diasInactividad` (7 a 365, por defecto 30), `diasEntreContactos` (7 a 365, por defecto 30), `agradecimientoActivo` (por defecto `false`) y las plantillas de WhatsApp y correo (asunto y cuerpo) para los motivos `inactividad` y `agradecimiento`. Las plantillas SHALL admitir las variables `{{nombre}}`, `{{negocio}}`, `{{telefonoNegocio}}` y `{{diasSinVenir}}`.

#### Scenario: Cambiar los días de inactividad
- **WHEN** el admin cambia `diasInactividad` a 45
- **THEN** desde la siguiente generación solo se crean recordatorios para clientes que no vuelven hace más de 45 días

### Requirement: Generación diaria de recordatorios
Una vez al día, a la hora configurada en la zona horaria del negocio, la API SHALL crear un recordatorio `pendiente` con motivo `inactividad` para cada cliente activo con `aceptaContacto: true`, con `ultimoServicioEn` anterior a hoy menos `diasInactividad`, sin recordatorio pendiente y sin contacto en los últimos `diasEntreContactos` días. La generación SHALL poder ejecutarse también con `POST /api/post-venta/generar` (exclusivo de `admin`), que responde `{ "creados": <n> }`, y ejecutarla dos veces el mismo día SHALL NOT duplicar recordatorios.

#### Scenario: Cliente que no vuelve hace 40 días
- **WHEN** corre la generación y un cliente que autorizó contacto no vuelve hace 40 días
- **THEN** se le crea un recordatorio pendiente de inactividad

#### Scenario: Cliente contactado hace una semana
- **WHEN** corre la generación y el cliente fue contactado hace 7 días
- **THEN** no se le crea un recordatorio nuevo

#### Scenario: Generación repetida
- **WHEN** el admin ejecuta `POST /api/post-venta/generar` dos veces el mismo día
- **THEN** la segunda responde `{ "creados": 0 }`

### Requirement: Agradecimiento después del servicio
Si `agradecimientoActivo` es `true`, la generación diaria SHALL crear un recordatorio con motivo `agradecimiento` para cada cliente con `aceptaContacto: true` atendido el día anterior que no tenga otro recordatorio pendiente.

#### Scenario: Agradecimiento desactivado
- **WHEN** `agradecimientoActivo` es `false`
- **THEN** no se crean recordatorios de agradecimiento

### Requirement: Recordatorios nunca sin autorización
La API SHALL NOT crear ni enviar recordatorios a clientes con `aceptaContacto: false` o inactivos. Si un cliente con recordatorio pendiente retira su autorización o se da de baja, su recordatorio SHALL pasar a `descartado`.

#### Scenario: Cliente retira la autorización
- **WHEN** un cliente con recordatorio pendiente pasa a `aceptaContacto: false`
- **THEN** su recordatorio queda `descartado` con la nota "El cliente retiró la autorización de contacto"

### Requirement: Listado de recordatorios
La API SHALL exponer `GET /api/post-venta/recordatorios` para usuarios autenticados, con paginación estándar y filtros `estado` (por defecto `pendiente`) y `motivo`, ordenado por `programadoPara` y luego por días sin venir, de más a menos. Cada recordatorio SHALL incluir el cliente (`id`, `nombre`, `telefono`, `email`, `ultimoServicioEn`), los días sin venir y los mensajes ya renderizados con la plantilla: `enlaceWhatsapp` (`https://wa.me/...` con el texto), `enlaceLlamada` (`tel:`) y, si el cliente tiene correo, `enlaceCorreo` (`mailto:` con asunto y cuerpo).

#### Scenario: Ver a quién contactar hoy
- **WHEN** se pide `GET /api/post-venta/recordatorios`
- **THEN** se listan los recordatorios pendientes con el enlace de WhatsApp listo para abrir

### Requirement: Envío de correo desde la API
La API SHALL exponer `POST /api/post-venta/recordatorios/:id/enviar-correo`, que envía el correo del recordatorio con el proveedor configurado y lo marca `contactado` con canal `email`. Si el cliente no tiene correo SHALL responder 409; si no hay proveedor configurado o el proveedor falla, SHALL responder 503 con un mensaje claro y dejar el recordatorio `pendiente`.

#### Scenario: Envío exitoso
- **WHEN** se envía el correo de un recordatorio de un cliente con correo y el proveedor está configurado
- **THEN** el cliente recibe el correo y el recordatorio queda `contactado` por `email`

#### Scenario: Sin proveedor de correo
- **WHEN** `EMAIL_PROVIDER` es `none`
- **THEN** la API responde 503 con el mensaje "El envío de correos no está configurado" y el recordatorio sigue pendiente

### Requirement: Registrar el resultado del contacto
La API SHALL exponer `POST /api/post-venta/recordatorios/:id/contactado` con `{ canal: "email" | "whatsapp" | "llamada", notas? }` y `POST /api/post-venta/recordatorios/:id/descartar` con `{ notas? }`, para usuarios autenticados. Ambos SHALL registrar `contactadoPor` y la fecha, y responder 409 si el recordatorio no está `pendiente`.

#### Scenario: Contacto por WhatsApp
- **WHEN** un usuario abre el enlace de WhatsApp, envía el mensaje y marca el recordatorio como contactado por `whatsapp`
- **THEN** el recordatorio queda `contactado` con canal, fecha y usuario
