# Spec Delta

## Purpose
Ajuste de la entidad Cliente a los datos que pidió el dueño del negocio en la fase 2.

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
| `ultimoServicioEn` | fecha | calculado: fecha del último servicio prestado no anulado; vacío si no tiene |
| `totalServicios` | número | calculado: cantidad de servicios prestados no anulados |

#### Scenario: Teléfono escrito sin código de país
- **WHEN** se registra un cliente con teléfono `912 345 678`
- **THEN** se guarda como `+351912345678`

#### Scenario: Teléfono repetido
- **WHEN** se intenta crear un cliente con un teléfono que ya tiene otro cliente activo
- **THEN** la operación se rechaza indicando qué cliente ya usa ese teléfono

#### Scenario: Cédula con espacios
- **WHEN** se registra un cliente con cédula `12345678 9 zz4`
- **THEN** se guarda como `123456789ZZ4`

### Requirement: Derecho de supresión de datos personales
Como el negocio está en la Unión Europea, cuando un cliente pida que se borren sus datos (RGPD), el sistema SHALL anonimizar al cliente en lugar de borrarlo: reemplazar `nombre` por "Cliente" y `apellido` por "eliminado", vaciar `cedula`, `telefono`, `email`, `direccion`, `fechaNacimiento` y `notas`, poner `aceptaContacto: false` y `activo: false`, y descartar sus recordatorios. Sus vehículos SHALL darse de baja con la placa anonimizada, y sus servicios prestados SHALL conservarse sin datos personales para que las métricas no cambien. La anonimización SHALL ser irreversible y solo la SHALL poder ejecutar un `admin`.

#### Scenario: Cliente pide que lo borren
- **WHEN** el admin anonimiza a un cliente con 5 servicios
- **THEN** ya no se puede ver su nombre, cédula, teléfono, correo, dirección, fecha de nacimiento ni placas en ninguna pantalla ni respuesta de la API
- **AND** los 5 servicios siguen contando en las métricas de sus fechas
