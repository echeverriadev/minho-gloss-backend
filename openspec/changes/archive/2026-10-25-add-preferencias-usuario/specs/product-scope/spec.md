# Spec Delta

## Purpose
Idioma de la app por usuario.

## MODIFIED Requirements

### Requirement: Contexto regional
La app SHALL estar en español por defecto y SHALL poder verse en portugués de Portugal (`pt-PT`) según la preferencia de cada usuario. El negocio está en Braga (Portugal), por lo que por defecto SHALL usar la zona horaria `Europe/Lisbon` (con su cambio de horario de verano), la moneda euro (EUR, con dos decimales), el formato regional `es-ES` para los textos en español (`pt-PT` cuando el usuario elige portugués) y el prefijo telefónico `+351`; estos valores SHALL poder cambiarse por configuración sin tocar código.

#### Scenario: Fin del día
- **WHEN** se registra un servicio a las 23:30 hora de Portugal
- **THEN** cuenta para las métricas de ese día y no del siguiente, aunque en UTC ya sea otro día

#### Scenario: Empleado portugués
- **WHEN** un empleado elige portugués en su perfil
- **THEN** ve todas las pantallas, avisos y errores en portugués de Portugal y los montos y fechas con formato `pt-PT`
