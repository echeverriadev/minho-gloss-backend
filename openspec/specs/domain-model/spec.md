# domain-model Specification

## Purpose
Modelo de dominio de Minho Gloss: entidades, campos, relaciones y reglas de negocio que comparten el backend (esquemas y DTOs) y el frontend (tipos y formularios). Esta spec es idéntica en ambos repos y es el contrato común entre ellos.

## Requirements

### Requirement: Convenciones comunes de las entidades
Toda entidad persistida SHALL tener `id` (texto, identificador de MongoDB), `createdAt` y `updatedAt` (fecha y hora ISO 8601 en UTC). Los nombres de campos SHALL estar en `camelCase` y en español para conceptos del negocio. Los montos de dinero SHALL guardarse como números enteros en la unidad mínima de la moneda configurada: céntimos de euro por defecto (15,00 € se guarda como `1500`). Las entidades que se pueden dar de baja SHALL usar baja lógica con el campo `activo` (booleano), nunca borrado físico, para no perder el historial.

#### Scenario: Leer un cliente desde la API
- **WHEN** el frontend obtiene un cliente
- **THEN** recibe `id`, `createdAt` y `updatedAt` además de los campos propios del cliente
- **AND** las fechas vienen en formato ISO 8601 con zona `Z`

#### Scenario: Dar de baja un tipo de servicio
- **WHEN** el admin elimina un tipo de servicio
- **THEN** el registro queda con `activo: false` y los servicios prestados que lo usaron conservan su información

### Requirement: Entidad Usuario
Un `Usuario` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, 2 a 80 caracteres |
| `email` | texto | obligatorio, formato de correo, único, se guarda en minúsculas |
| `password` | texto | solo de entrada; mínimo 8 caracteres; se guarda únicamente su hash y nunca se devuelve |
| `rol` | `admin` \| `empleado` | obligatorio |
| `activo` | booleano | por defecto `true`; un usuario inactivo no puede iniciar sesión |

SHALL existir siempre al menos un usuario `admin` activo.

#### Scenario: Desactivar al último admin
- **WHEN** se intenta desactivar o cambiar de rol al único admin activo
- **THEN** la operación se rechaza con un error de conflicto

### Requirement: Entidad Cliente
Un `Cliente` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, 2 a 120 caracteres |
| `telefono` | texto | obligatorio, se normaliza a formato E.164 (por ejemplo `+351912345678`) usando el código de país por defecto si no se indica; único entre clientes activos |
| `email` | texto | opcional, formato de correo, en minúsculas |
| `aceptaContacto` | booleano | obligatorio; indica si el cliente autorizó recibir mensajes de post-venta (por defecto `false`) |
| `notas` | texto | opcional, hasta 500 caracteres |
| `activo` | booleano | por defecto `true` |
| `ultimoServicioEn` | fecha | calculado: fecha del último servicio prestado no anulado; vacío si no tiene |
| `totalServicios` | número | calculado: cantidad de servicios prestados no anulados |

#### Scenario: Teléfono escrito sin código de país
- **WHEN** se registra un cliente con teléfono `912 345 678`
- **THEN** se guarda como `+351912345678`

#### Scenario: Teléfono repetido
- **WHEN** se intenta crear un cliente con un teléfono que ya tiene otro cliente activo
- **THEN** la operación se rechaza indicando qué cliente ya usa ese teléfono

### Requirement: Entidad Vehiculo
Un `Vehiculo` SHALL pertenecer a exactamente un cliente y tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `clienteId` | referencia a Cliente | obligatorio |
| `placa` | texto | obligatorio; se normaliza a mayúsculas sin espacios ni guiones (`aa-12-bb` → `AA12BB`); única entre vehículos activos |
| `tipo` | `auto` \| `camioneta` \| `moto` \| `otro` | obligatorio |
| `marca` | texto | opcional, hasta 40 caracteres |
| `modelo` | texto | opcional, hasta 40 caracteres |
| `color` | texto | opcional, hasta 30 caracteres |
| `activo` | booleano | por defecto `true` |

Un cliente SHALL poder tener cero o más vehículos.

#### Scenario: Placa ya registrada a otro cliente
- **WHEN** se intenta registrar la placa `AA12BB` y ya pertenece a un vehículo activo de otro cliente
- **THEN** la operación se rechaza indicando el cliente actual del vehículo

### Requirement: Entidad TipoServicio
Un `TipoServicio` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, único entre tipos activos, 2 a 60 caracteres |
| `descripcion` | texto | opcional, hasta 300 caracteres |
| `precioBase` | entero | obligatorio, mayor o igual a 0 |
| `preciosPorVehiculo` | objeto | opcional; precio específico por tipo de vehículo, por ejemplo `{ "camioneta": 2000, "moto": 1000 }` (en céntimos) |
| `duracionMinutos` | entero | opcional, estimado, entre 5 y 600 |
| `orden` | entero | opcional, por defecto 0; posición en la que se muestra en la app |
| `activo` | booleano | por defecto `true` |

El precio de lista de un servicio para un vehículo SHALL ser el de `preciosPorVehiculo` para su tipo si existe, y si no `precioBase`.

#### Scenario: Precio por tipo de vehículo
- **WHEN** el tipo "Lavado sencillo" tiene `precioBase` 1500 (15,00 €) y `preciosPorVehiculo.camioneta` 2000 (20,00 €)
- **THEN** su precio de lista es 2000 para una camioneta y 1500 para un auto

### Requirement: Entidad ServicioPrestado
Un `ServicioPrestado` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `clienteId` | referencia a Cliente | obligatorio |
| `vehiculoId` | referencia a Vehiculo | obligatorio; debe pertenecer al cliente |
| `tipoServicioId` | referencia a TipoServicio | obligatorio; debe estar activo al registrar |
| `tipoServicioNombre` | texto | copia del nombre del tipo al momento de registrar |
| `precioLista` | entero | copia del precio de lista al momento de registrar |
| `precioCobrado` | entero | obligatorio, mayor o igual a 0; por defecto igual a `precioLista` |
| `metodoPago` | `efectivo` \| `tarjeta` \| `mbway` \| `transferencia` \| `otro` | obligatorio |
| `realizadoEn` | fecha y hora | obligatorio; por defecto el momento del registro; no puede estar en el futuro |
| `registradoPor` | referencia a Usuario | asignado automáticamente con el usuario de la sesión |
| `notas` | texto | opcional, hasta 300 caracteres |
| `estado` | `completado` \| `anulado` | por defecto `completado` |
| `anulacion` | objeto | solo si está anulado: `motivo` (obligatorio), `anuladoPor`, `anuladoEn` |

Cambiar el precio de un tipo de servicio SHALL NOT alterar los servicios prestados ya registrados. Un servicio anulado SHALL NOT contar en métricas ni en `ultimoServicioEn`/`totalServicios` del cliente.

#### Scenario: Descuento a un cliente frecuente
- **WHEN** se registra un servicio con `precioLista` 1500 y `precioCobrado` 1350
- **THEN** se guardan ambos valores y las métricas de ingresos usan 1350

#### Scenario: Cambio de precio posterior
- **WHEN** el admin sube el precio de un tipo de servicio
- **THEN** los servicios prestados anteriores conservan el precio con el que se registraron

### Requirement: Entidad Recordatorio
Un `Recordatorio` de post-venta SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `clienteId` | referencia a Cliente | obligatorio |
| `motivo` | `inactividad` \| `agradecimiento` | obligatorio |
| `programadoPara` | fecha | obligatorio |
| `estado` | `pendiente` \| `contactado` \| `descartado` | por defecto `pendiente` |
| `canal` | `email` \| `whatsapp` \| `llamada` | se asigna al marcarlo como contactado |
| `contactadoEn` | fecha y hora | se asigna al marcarlo como contactado |
| `contactadoPor` | referencia a Usuario | se asigna al marcarlo como contactado |
| `notas` | texto | opcional, hasta 300 caracteres |

Un cliente SHALL tener como máximo un recordatorio `pendiente` a la vez.

#### Scenario: Cliente sin autorización de contacto
- **WHEN** un cliente tiene `aceptaContacto: false`
- **THEN** nunca se le genera un recordatorio

### Requirement: Relaciones y borrado
Las relaciones SHALL ser: un Cliente tiene muchos Vehículos; un Servicio prestado pertenece a un Cliente, un Vehículo, un Tipo de servicio y un Usuario; un Recordatorio pertenece a un Cliente. Dar de baja un cliente SHALL dar de baja también sus vehículos, sin tocar sus servicios prestados ni su historial.

#### Scenario: Baja de un cliente con historial
- **WHEN** se da de baja un cliente con 10 servicios prestados
- **THEN** el cliente y sus vehículos quedan con `activo: false`
- **AND** sus 10 servicios siguen contando en las métricas de las fechas en que se prestaron

### Requirement: Derecho de supresión de datos personales
Como el negocio está en la Unión Europea, cuando un cliente pida que se borren sus datos (RGPD), el sistema SHALL anonimizar al cliente en lugar de borrarlo: reemplazar `nombre` por "Cliente eliminado", vaciar `telefono`, `email` y `notas`, poner `aceptaContacto: false` y `activo: false`, y descartar sus recordatorios. Sus vehículos SHALL darse de baja con la placa anonimizada, y sus servicios prestados SHALL conservarse sin datos personales para que las métricas no cambien. La anonimización SHALL ser irreversible y solo la SHALL poder ejecutar un `admin`.

#### Scenario: Cliente pide que lo borren
- **WHEN** el admin anonimiza a un cliente con 5 servicios
- **THEN** ya no se puede ver su nombre, teléfono, correo ni placas en ninguna pantalla ni respuesta de la API
- **AND** los 5 servicios siguen contando en las métricas de sus fechas
