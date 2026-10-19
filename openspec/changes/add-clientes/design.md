# Design

## Context

El dueño atiende desde el celular y la forma más rápida de identificar a un cliente es la placa del vehículo o el teléfono. Se esperan cientos o pocos miles de clientes, por lo que MongoDB Atlas M0 (512 MB) alcanza de sobra.

## Goals / Non-Goals

**Goals:**
- Encontrar a un cliente escribiendo parte del nombre, el teléfono o la placa en un solo campo.
- Evitar duplicados por teléfono y por placa.

**Non-Goals:**
- Búsqueda difusa o por similitud fonética.

## Decisions

1. **Vehículos en su propia colección con `clienteId`**, no embebidos en el cliente. Permite buscar por placa con un índice único y referenciarlos desde los servicios prestados. Alternativa: arreglo embebido; descartada porque complica la unicidad de la placa y las referencias.
2. **Índices únicos parciales** (`partialFilterExpression: { activo: true }`) en `clientes.telefono` y `vehiculos.placa`, para que un cliente dado de baja no bloquee reutilizar su teléfono o placa.
3. **Normalización en un solo lugar** (`src/common/normalizacion/`): `normalizarTelefono(texto, codigoPais)` quita espacios, guiones y paréntesis, agrega `+<codigo>` si falta y valida longitud de 8 a 15 dígitos; `normalizarPlaca(texto)` pasa a mayúsculas y deja solo letras y números. Se aplica en los DTOs con `@Transform` para que la validación vea el valor normalizado. Alternativa: `libphonenumber-js`; se deja como mejora si aparecen números de otros países.
4. **Búsqueda `q`**: si `q` normalizado parece placa o teléfono se busca por prefijo en esos campos; además siempre se busca por nombre con expresión regular insensible a mayúsculas y acentos anclada a inicio de palabra. Los resultados se unen sin duplicados. Con el volumen esperado no hace falta un índice de texto completo ni Atlas Search.
5. **Ficha del cliente** (`GET /api/clientes/:id`) devuelve el cliente con sus vehículos activos embebidos en la respuesta, para que el frontend no haga dos llamadas.
6. **Campos calculados persistidos** (`ultimoServicioEn`, `totalServicios`) en el documento del cliente y actualizados por el módulo de servicios prestados, en vez de calcularlos en cada consulta; así el listado y la post-venta son baratos.
7. **Alta de cliente con vehículos sin transacciones de MongoDB.** El Mongo local de Docker corre como instancia única, que no admite transacciones. Se validan primero todas las placas y el teléfono, luego se crean los documentos y, si falla un vehículo, se borra lo creado en esa misma petición (compensación). Alternativa: configurar Mongo local como replica set de un nodo; se evalúa si aparecen más operaciones multi-documento.

## Risks / Trade-offs

- [Expresión regular sobre `nombre` sin índice de texto] → aceptable con miles de documentos; si crece se agrega un campo `nombreNormalizado` indexado.
- [Campos calculados pueden desincronizarse] → se recalculan dentro de la misma operación que crea o anula un servicio, y se agrega una tarea de mantenimiento si hiciera falta.
