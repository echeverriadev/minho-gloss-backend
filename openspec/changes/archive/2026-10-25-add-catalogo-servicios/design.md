# Design

## Context

El catálogo real del negocio tiene 5 servicios con cuatro precios cada uno (Ligeiro / SUV / Monovolume / Carrinha) y 5 extras: tres con un precio único y dos con dos precios ("Lavagem de estofos: 50€ / 70€", "Polimento de faróis: 60€ / 80€"). Son pocas entradas (decenas como mucho), así que no hace falta paginar.

## Decisions

1. **Una sola entidad `TipoServicio` con `categoria: 'servicio' | 'extra'`**, en lugar de dos colecciones. Servicios y extras se gestionan, se listan y se cobran igual; la categoría solo separa cómo se muestran y permite que el registro de servicios pida un servicio principal y extras opcionales.
2. **`modoPrecio: 'por-vehiculo' | 'unico'`.** Con `por-vehiculo` los cuatro precios son obligatorios (`precios.ligeiro`, `precios.suv`, `precios.monovolume`, `precios.carrinha`); con `unico` se usa `precioUnico` para cualquier vehículo. Se descartó "precio base más excepciones" del borrador anterior porque el negocio siempre define los cuatro precios.
3. **Extras con dos precios** se cargan como `por-vehiculo`: 50 € para Ligeiro y SUV y 70 € para Monovolume y Carrinha (igual para faróis con 60/80 €). Es una suposición pendiente de confirmar con el dueño; si los dos precios significan otra cosa (por ejemplo dos variantes del extra), se agrega un tercer modo de precio en un cambio aparte.
4. **Montos en céntimos** como el resto del dominio (13 € → `1300`).
5. **Carga inicial con `npm run seed:catalogo`**: compila y ejecuta `dist/seeds/catalogo-inicial.js` con un contexto de NestJS; inserta el catálogo solo si no hay ninguna entrada, así que se puede correr sin riesgo en desarrollo y en el primer despliegue.

## Risks / Trade-offs

- [Interpretación de los extras con dos precios] → documentada y fácil de corregir desde la pantalla del admin.
- [Cambiar los tipos de vehículo] → todavía no hay vehículos guardados (`add-vehiculos` está pendiente), así que no hay datos que migrar.
