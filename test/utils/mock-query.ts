import { Types } from 'mongoose';

/** Simula una consulta encadenable de Mongoose que resuelve con `valor` al llamar a `exec()`. */
export function query<T>(valor: T) {
  const q = {
    lean: () => q,
    select: () => q,
    exec: () => Promise.resolve(valor),
  };
  return q;
}

export function nuevoId(): Types.ObjectId {
  return new Types.ObjectId();
}
