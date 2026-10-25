import {
  escapeRegex,
  normalizarCedula,
  normalizarTelefono,
  normalizarTextoBusqueda,
} from './normalizacion.js';

describe('normalizarTelefono', () => {
  it('agrega el código de país por defecto', () => {
    expect(normalizarTelefono('912 345 678', '351')).toBe('+351912345678');
  });

  it('quita guiones, puntos y paréntesis', () => {
    expect(normalizarTelefono('(912) 345-678', '351')).toBe('+351912345678');
    expect(normalizarTelefono('912.345.678', '351')).toBe('+351912345678');
  });

  it('respeta un código de país escrito con + o con 00', () => {
    expect(normalizarTelefono('+34 612 345 678', '351')).toBe('+34612345678');
    expect(normalizarTelefono('0034612345678', '351')).toBe('+34612345678');
  });

  it('rechaza textos con letras o con un largo inválido', () => {
    expect(normalizarTelefono('91234abc', '351')).toBeNull();
    expect(normalizarTelefono('123', '351')).toBeNull();
    expect(normalizarTelefono('+1234567890123456', '351')).toBeNull();
  });
});

describe('normalizarCedula', () => {
  it('pasa a mayúsculas y quita espacios, puntos y guiones', () => {
    expect(normalizarCedula(' 12345678 9 zz4 ')).toBe('123456789ZZ4');
    expect(normalizarCedula('123.456-789')).toBe('123456789');
  });
});

describe('normalizarTextoBusqueda', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizarTextoBusqueda('José Pérez Núñez')).toBe('jose perez nunez');
  });
});

describe('escapeRegex', () => {
  it('escapa los caracteres especiales', () => {
    expect(escapeRegex('a.b*c')).toBe(String.raw`a\.b\*c`);
  });
});
