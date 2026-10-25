import { Transform } from 'class-transformer';

/** Recorta los espacios de un texto antes de validarlo. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

/** Recorta y pasa a minúsculas (correos). */
export const TrimLowercase = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

/** Convierte `"true"`/`"false"` de la query string en booleano. */
export const QueryBoolean = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) {
      return true;
    }
    if (value === 'false' || value === false) {
      return false;
    }
    return value;
  });
