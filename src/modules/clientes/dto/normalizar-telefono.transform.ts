import { Transform } from 'class-transformer';
import { normalizarTelefono } from '../../../common/normalizacion/normalizacion.js';

let codigoPaisPorDefecto = '351';

/** Lo fija `ClientesModule` al arrancar con `DEFAULT_COUNTRY_CODE`, porque los DTOs no tienen inyección. */
export function setCodigoPaisPorDefecto(codigo: string): void {
  codigoPaisPorDefecto = codigo;
}

/** Normaliza a E.164; si no se puede, deja el texto para que la validación lo rechace. */
export const NormalizarTelefono = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return normalizarTelefono(value, codigoPaisPorDefecto) ?? value;
  });
