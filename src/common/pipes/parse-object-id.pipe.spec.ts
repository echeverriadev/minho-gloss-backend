import { BadRequestException } from '@nestjs/common';
import { ParseObjectIdPipe } from './parse-object-id.pipe.js';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('acepta un ObjectId válido', () => {
    expect(pipe.transform('652f1c2b9d1e8a0012345678')).toBe('652f1c2b9d1e8a0012345678');
  });

  it('rechaza un id con formato inválido', () => {
    expect(() => pipe.transform('123')).toThrow(BadRequestException);
    expect(() => pipe.transform('abcdefghijkl')).toThrow('El id no es válido');
  });
});
