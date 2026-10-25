import type { Types } from 'mongoose';

/** Id de MongoDB como texto, para las respuestas de la API (que usan `id` y no `_id`). */
export function toId(documento: { _id: Types.ObjectId }): string {
  // oxlint-disable-next-line no-underscore-dangle -- `_id` es el nombre fijo del identificador en MongoDB
  return documento._id.toString();
}
