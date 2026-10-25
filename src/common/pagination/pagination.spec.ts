import { parseSort } from './pagination-query.dto.js';

describe('parseSort', () => {
  const permitidos = ['nombre', 'createdAt'];

  it('usa el orden por defecto si no se indica', () => {
    expect(parseSort(undefined, permitidos, { nombre: 1 })).toEqual({ nombre: 1 });
  });

  it('interpreta el guion como orden descendente', () => {
    expect(parseSort('-createdAt', permitidos, { nombre: 1 })).toEqual({ createdAt: -1 });
  });

  it('ignora campos no permitidos', () => {
    expect(parseSort('passwordHash', permitidos, { nombre: 1 })).toEqual({ nombre: 1 });
  });
});
