# Spec Delta

## Purpose
La operación diaria se registra por atención (la visita de un vehículo), con uno o más servicios prestados, cliente opcional y precios personalizados por el admin.

## ADDED Requirements

### Requirement: Entidad Atencion
Una `Atencion` es la visita de un vehículo al autolavado y SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `numero` | entero | asignado por la API, correlativo desde 1 y único; identifica el detalle impreso |
| `clienteId` | referencia a Cliente | opcional; vacío cuando el cliente no quiere registrarse; si se envía, el cliente debe estar activo |
| `tipoVehiculo` | `ligeiro` \| `suv` \| `monovolume` \| `carrinha` | obligatorio; define el precio de lista de cada servicio |
| `placa` | texto | opcional; se normaliza a mayúsculas sin espacios, puntos ni guiones y debe quedar con 2 a 12 letras o números |
| `items` | lista | obligatorio, de 1 a 20 servicios prestados (ver abajo) |
| `total` | entero | calculado: suma de `precio` de los ítems, en céntimos |
| `metodoPago` | `efectivo` \| `tarjeta` \| `mbway` \| `transferencia` \| `otro` | obligatorio |
| `realizadoEn` | fecha y hora | obligatorio; por defecto el momento del registro; no puede estar en el futuro |
| `registradoPor` | referencia a Usuario | asignado automáticamente con el usuario de la sesión |
| `notas` | texto | opcional, hasta 300 caracteres |
| `estado` | `completada` \| `anulada` | por defecto `completada` |
| `anulacion` | objeto | solo si está anulada: `motivo` (obligatorio, 3 a 200 caracteres), `anuladoPor`, `anuladoEn` |

Cada ítem de `items` es un **servicio prestado** y SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `tipoServicioId` | referencia a TipoServicio | obligatorio salvo en los personalizados; debe estar activo al registrar |
| `nombre` | texto | copia del nombre del catálogo al registrar, o el nombre escrito por el admin en los personalizados (2 a 60 caracteres) |
| `categoria` | `servicio` \| `extra` \| `personalizado` | copia de la categoría del catálogo, o `personalizado` |
| `precioLista` | entero o vacío | copia del precio de lista para `tipoVehiculo` al registrar; vacío en los personalizados |
| `precio` | entero | precio cobrado en céntimos, 0 o mayor; por defecto igual a `precioLista` |

Solo un `admin` SHALL poder cobrar un `precio` distinto de `precioLista` o agregar ítems `personalizado`. Cambiar el catálogo SHALL NOT alterar las atenciones ya registradas, y personalizar un precio SHALL NOT cambiar el catálogo. Una atención anulada SHALL NOT contar en métricas ni en los contadores del cliente.

#### Scenario: Cliente frecuente con descuento
- **WHEN** el admin registra FULL GLOSS (lista 2500) cobrado a 2000 y el extra Lavagem do motor (lista 4000)
- **THEN** la atención guarda ambos precios de lista, `total` 6000, y el catálogo sigue con FULL GLOSS a 2500

#### Scenario: Cliente de paso
- **WHEN** un empleado registra una atención sin `clienteId`
- **THEN** la atención cuenta en las métricas del día sin estar asociada a ningún cliente

#### Scenario: Cambio de precio posterior
- **WHEN** el admin sube el precio de un tipo de servicio
- **THEN** las atenciones anteriores conservan el precio con el que se registraron

## MODIFIED Requirements

### Requirement: Entidad Cliente
Un `Cliente` SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, 2 a 60 caracteres |
| `apellido` | texto | obligatorio, 2 a 60 caracteres |
| `cedula` | texto | obligatorio; documento de identidad libre (NIF, Cartão de Cidadão, pasaporte); se normaliza a mayúsculas sin espacios, puntos ni guiones y debe quedar con 4 a 20 letras o números; único entre clientes activos |
| `telefono` | texto | obligatorio, teléfono celular; se normaliza a formato E.164 (por ejemplo `+351912345678`) usando el código de país por defecto si no se indica; único entre clientes activos |
| `email` | texto | obligatorio, formato de correo, hasta 120 caracteres, en minúsculas |
| `direccion` | texto | obligatorio, 5 a 200 caracteres |
| `fechaNacimiento` | fecha `YYYY-MM-DD` | obligatorio; fecha real, no futura y posterior a 1900-01-01 |
| `aceptaContacto` | booleano | obligatorio; indica si el cliente autorizó recibir mensajes de post-venta (por defecto `false`) |
| `notas` | texto | opcional, hasta 500 caracteres |
| `activo` | booleano | por defecto `true` |
| `ultimoServicioEn` | fecha | calculado: `realizadoEn` de su última atención completada; vacío si no tiene |
| `totalServicios` | número | calculado: cantidad de atenciones (visitas) completadas del cliente |

#### Scenario: Teléfono escrito sin código de país
- **WHEN** se registra un cliente con teléfono `912 345 678`
- **THEN** se guarda como `+351912345678`

#### Scenario: Teléfono repetido
- **WHEN** se intenta crear un cliente con un teléfono que ya tiene otro cliente activo
- **THEN** la operación se rechaza indicando qué cliente ya usa ese teléfono

#### Scenario: Cédula con espacios
- **WHEN** se registra un cliente con cédula `12345678 9 zz4`
- **THEN** se guarda como `123456789ZZ4`

### Requirement: Relaciones y borrado
Las relaciones SHALL ser: un Cliente tiene muchos Vehículos y muchas Atenciones; una Atención pertenece opcionalmente a un Cliente y a un Usuario, y cada uno de sus servicios prestados a un Tipo de servicio (salvo los personalizados); un Recordatorio pertenece a un Cliente. Dar de baja un cliente SHALL dar de baja también sus vehículos, sin tocar sus atenciones ni su historial.

#### Scenario: Baja de un cliente con historial
- **WHEN** se da de baja un cliente con 10 atenciones
- **THEN** el cliente y sus vehículos quedan con `activo: false`
- **AND** sus 10 atenciones siguen contando en las métricas de las fechas en que se hicieron

### Requirement: Derecho de supresión de datos personales
Como el negocio está en la Unión Europea, cuando un cliente pida que se borren sus datos (RGPD), el sistema SHALL anonimizar al cliente en lugar de borrarlo: reemplazar `nombre` por "Cliente" y `apellido` por "eliminado", vaciar `cedula`, `telefono`, `email`, `direccion`, `fechaNacimiento` y `notas`, poner `aceptaContacto: false` y `activo: false`, y descartar sus recordatorios. Sus vehículos SHALL darse de baja con la placa anonimizada, la `placa` de sus atenciones SHALL vaciarse, y sus atenciones SHALL conservarse sin datos personales para que las métricas no cambien. La anonimización SHALL ser irreversible y solo la SHALL poder ejecutar un `admin`.

#### Scenario: Cliente pide que lo borren
- **WHEN** el admin anonimiza a un cliente con 5 atenciones
- **THEN** ya no se puede ver su nombre, cédula, teléfono, correo, dirección, fecha de nacimiento ni placas en ninguna pantalla, detalle impreso ni respuesta de la API
- **AND** las 5 atenciones siguen contando en las métricas de sus fechas

## REMOVED Requirements

### Requirement: Entidad ServicioPrestado
**Reason**: el dueño pidió registrar la visita completa de un vehículo, con varios servicios, cliente opcional y precios personalizados; un registro por servicio obligaba a repetir cliente, vehículo y pago.
**Migration**: cada servicio prestado pasa a ser un ítem de una `Atencion`. No hay datos que migrar porque los servicios prestados no llegaron a implementarse.
