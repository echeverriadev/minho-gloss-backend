/**
 * Días de calendario en la zona horaria del negocio (spec product-scope: `Europe/Lisbon` por
 * defecto). Las fechas se guardan en UTC; estos cálculos usan `Intl` y respetan el horario de verano.
 */

const FORMATOS = new Map<string, Intl.DateTimeFormat>();

function formato(zona: string): Intl.DateTimeFormat {
  let actual = FORMATOS.get(zona);
  if (!actual) {
    actual = new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    FORMATOS.set(zona, actual);
  }
  return actual;
}

function partes(fecha: Date, zona: string): Record<string, number> {
  return Object.fromEntries(
    formato(zona)
      .formatToParts(fecha)
      .filter((parte) => parte.type !== 'literal')
      .map((parte) => [parte.type, Number(parte.value)]),
  );
}

/** Diferencia en milisegundos entre la hora local de `zona` y UTC en ese instante. */
function desfase(fecha: Date, zona: string): number {
  const p = partes(fecha, zona);
  const comoUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return comoUtc - Math.floor(fecha.getTime() / 1000) * 1000;
}

/** Día `YYYY-MM-DD` en `zona` del instante `fecha`. */
export function diaEnZona(fecha: Date, zona: string): string {
  const p = partes(fecha, zona);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Instante UTC en que empieza el día `YYYY-MM-DD` en `zona`. */
export function inicioDelDia(dia: string, zona: string): Date {
  const [anio, mes, diaMes] = dia.split('-').map(Number);
  const medianocheUtc = Date.UTC(anio, mes - 1, diaMes);
  // Dos pasadas: la primera estima con el desfase de la medianoche UTC y la segunda corrige
  // si el cambio de horario cae entre ese instante y la medianoche local.
  const estimado = medianocheUtc - desfase(new Date(medianocheUtc), zona);
  return new Date(medianocheUtc - desfase(new Date(estimado), zona));
}

/** Día siguiente a `dia` (`YYYY-MM-DD`). */
export function diaSiguiente(dia: string): string {
  const [anio, mes, diaMes] = dia.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, diaMes + 1)).toISOString().slice(0, 10);
}

/** Rango UTC `[desde, hasta)` que cubre los días `desde` a `hasta` (inclusive) en `zona`. */
export function rangoDeDias(desde: string, hasta: string, zona: string): { $gte: Date; $lt: Date } {
  return { $gte: inicioDelDia(desde, zona), $lt: inicioDelDia(diaSiguiente(hasta), zona) };
}
