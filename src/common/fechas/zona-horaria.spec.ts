import { diaEnZona, diaSiguiente, inicioDelDia, rangoDeDias } from './zona-horaria.js';

const LISBOA = 'Europe/Lisbon';

describe('zona horaria del negocio', () => {
  it('una atención a las 23:30 en Lisboa (verano) cuenta en ese día', () => {
    // 2026-07-10 23:30 en Lisboa (UTC+1) = 22:30 UTC
    expect(diaEnZona(new Date('2026-07-10T22:30:00Z'), LISBOA)).toBe('2026-07-10');
    // 00:30 del día siguiente en Lisboa = 23:30 UTC del día anterior
    expect(diaEnZona(new Date('2026-07-10T23:30:00Z'), LISBOA)).toBe('2026-07-11');
  });

  it('el día empieza a medianoche local en verano y en invierno', () => {
    expect(inicioDelDia('2026-07-10', LISBOA).toISOString()).toBe('2026-07-09T23:00:00.000Z');
    expect(inicioDelDia('2026-12-10', LISBOA).toISOString()).toBe('2026-12-10T00:00:00.000Z');
  });

  it('el día del cambio de horario dura 25 horas', () => {
    // En 2026 el horario de verano termina el 25 de octubre en Portugal.
    const rango = rangoDeDias('2026-10-25', '2026-10-25', LISBOA);
    expect(rango.$gte.toISOString()).toBe('2026-10-24T23:00:00.000Z');
    expect(rango.$lt.toISOString()).toBe('2026-10-26T00:00:00.000Z');
  });

  it('funciona con otras zonas', () => {
    expect(inicioDelDia('2026-03-01', 'America/Caracas').toISOString()).toBe(
      '2026-03-01T04:00:00.000Z',
    );
  });

  it('calcula el día siguiente cruzando meses y años', () => {
    expect(diaSiguiente('2026-12-31')).toBe('2027-01-01');
    expect(diaSiguiente('2028-02-28')).toBe('2028-02-29');
  });
});
