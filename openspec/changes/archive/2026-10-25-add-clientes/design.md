# Design

## Context

El dueño atiende desde el celular y la forma más rápida de identificar a un cliente es el teléfono, el nombre o la cédula. Se esperan cientos o pocos miles de clientes, por lo que MongoDB Atlas M0 (512 MB) alcanza de sobra. El negocio está en Braga, así que la mayoría de los documentos serán NIF (9 dígitos) o Cartão de Cidadão, pero también puede haber pasaportes o documentos de otros países.

## Goals / Non-Goals

**Goals:**
- Encontrar a un cliente escribiendo parte del nombre, apellido, teléfono o cédula en un solo campo.
- Evitar duplicados por teléfono y por cédula.

**Non-Goals:**
- Validar el dígito de control del NIF o del Cartão de Cidadão.
- Búsqueda difusa o por similitud fonética.

## Decisions

1. **Cédula como texto libre normalizado.** Se guarda en mayúsculas sin espacios, puntos ni guiones (`12345678 9 zz4` → `123456789ZZ4`), con 4 a 20 letras o números. Sirve para NIF, Cartão de Cidadão, pasaporte o documento extranjero. Alternativa: validar el NIF portugués; descartada porque deja fuera a clientes extranjeros.
2. **Fecha de nacimiento como texto `YYYY-MM-DD`**, sin hora ni zona. Es una fecha de calendario: guardarla como `Date` en UTC haría que se vea un día antes o después según la zona. Se valida que sea una fecha real, no futura y posterior a 1900-01-01.
3. **Índices únicos parciales** (`partialFilterExpression: { activo: true }`) en `telefono` y `cedula`, para que un cliente dado de baja no bloquee reutilizar sus datos. Antes de guardar se busca el duplicado para responder 409 con el nombre e `id` del otro cliente; el índice cubre las carreras.
4. **Normalización en un solo lugar** (`src/common/normalizacion/`): `normalizarTelefono(texto, codigoPais)` quita espacios, guiones, puntos y paréntesis, convierte `00` inicial en `+`, agrega `+<codigo>` si falta y valida de 8 a 15 dígitos; `normalizarCedula(texto)` aplica la regla de la decisión 1. Se aplican en los DTOs con `@Transform` para que la validación vea el valor normalizado. Alternativa: `libphonenumber-js`; se deja como mejora si aparecen números de otros países.
5. **Búsqueda `q`** con expresiones regulares: por inicio de palabra en `nombre` y `apellido` sin distinguir mayúsculas ni tildes (se guarda un campo interno `busqueda` con nombre y apellido sin tildes y en minúsculas), por prefijo de `cedula` normalizada y por prefijo de `telefono` normalizado. Con el volumen esperado no hace falta un índice de texto completo ni Atlas Search.
6. **Campos calculados persistidos** (`ultimoServicioEn`, `totalServicios`) en el documento del cliente y actualizados por el módulo de servicios prestados, en vez de calcularlos en cada consulta.
7. **Anonimización sin validaciones de DTO**: se escribe directamente en el modelo, reemplaza `nombre` por "Cliente" y `apellido` por "eliminado", y quita `cedula`, `telefono`, `email`, `direccion`, `fechaNacimiento` y `notas`. Como queda inactivo, no choca con los índices únicos parciales.

## Risks / Trade-offs

- [Expresión regular sobre `busqueda` sin índice de texto] → aceptable con miles de documentos; si crece se agrega un índice.
- [Dirección y fecha de nacimiento obligatorias pueden frenar el alta en el patio] → es lo que pidió el dueño; si molesta en la práctica se pasan a opcionales con un cambio pequeño.
- [Datos personales sensibles (cédula, fecha de nacimiento)] → solo los ven usuarios con sesión, nunca se escriben en los logs y se borran con la anonimización (RGPD).
