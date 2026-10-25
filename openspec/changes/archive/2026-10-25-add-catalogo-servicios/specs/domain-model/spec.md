# Spec Delta

## Purpose
Tipos de vehículo y catálogo de servicios del negocio.

## MODIFIED Requirements

### Requirement: Entidad Vehiculo
Un `Vehiculo` SHALL pertenecer a exactamente un cliente y tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `clienteId` | referencia a Cliente | obligatorio |
| `placa` | texto | obligatorio; se normaliza a mayúsculas sin espacios ni guiones (`aa-12-bb` → `AA12BB`); única entre vehículos activos |
| `tipo` | `ligeiro` \| `suv` \| `monovolume` \| `carrinha` | obligatorio; en la interfaz se muestra como Ligeiro, SUV, Monovolume y Carrinha |
| `marca` | texto | opcional, hasta 40 caracteres |
| `modelo` | texto | opcional, hasta 40 caracteres |
| `color` | texto | opcional, hasta 30 caracteres |
| `activo` | booleano | por defecto `true` |

Un cliente SHALL poder tener cero o más vehículos.

#### Scenario: Placa ya registrada a otro cliente
- **WHEN** se intenta registrar la placa `AA12BB` y ya pertenece a un vehículo activo de otro cliente
- **THEN** la operación se rechaza indicando el cliente actual del vehículo

### Requirement: Entidad TipoServicio
Un `TipoServicio` es una entrada del catálogo (un servicio o un extra) y SHALL tener:

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `nombre` | texto | obligatorio, el título del servicio; único entre entradas activas sin distinguir mayúsculas; 2 a 60 caracteres |
| `descripcion` | texto | opcional, hasta 300 caracteres |
| `categoria` | `servicio` \| `extra` | obligatorio; los extras se suman a un servicio |
| `modoPrecio` | `por-vehiculo` \| `unico` | obligatorio |
| `precios` | objeto | obligatorio si `modoPrecio` es `por-vehiculo`: `{ ligeiro, suv, monovolume, carrinha }`, enteros en céntimos mayores o iguales a 0 |
| `precioUnico` | entero | obligatorio si `modoPrecio` es `unico`, en céntimos, mayor o igual a 0 |
| `orden` | entero | opcional, por defecto 0; posición dentro de su categoría |
| `activo` | booleano | por defecto `true` |

El precio de lista de una entrada para un vehículo SHALL ser `precioUnico` si el modo es `unico`, o el de `precios` para el tipo del vehículo si es `por-vehiculo`.

#### Scenario: Precio por tipo de vehículo
- **WHEN** "FULL GLOSS" tiene precios 2500, 3000, 3500 y 4000 (Ligeiro, SUV, Monovolume, Carrinha)
- **THEN** su precio de lista es 3500 para un Monovolume y 2500 para un Ligeiro

#### Scenario: Extra de precio único
- **WHEN** el extra "Lavagem do motor" tiene `precioUnico` 4000
- **THEN** su precio de lista es 4000 para cualquier vehículo

