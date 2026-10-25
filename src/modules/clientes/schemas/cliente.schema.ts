import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'clientes', timestamps: true })
export class Cliente {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  // Opcional en el esquema solo para permitir la anonimización (RGPD); el DTO lo exige.
  @Prop({ type: String })
  cedula?: string | null;

  @Prop({ type: String })
  telefono?: string | null;

  @Prop({ type: String, lowercase: true, trim: true })
  email?: string | null;

  @Prop({ type: String, trim: true })
  direccion?: string | null;

  /** Fecha de calendario `YYYY-MM-DD`, sin hora ni zona (design de add-clientes). */
  @Prop({ type: String })
  fechaNacimiento?: string | null;

  @Prop({ required: true, default: false })
  aceptaContacto: boolean;

  @Prop({ type: String, trim: true })
  notas?: string | null;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: false })
  anonimizado: boolean;

  @Prop({ type: Date, default: null })
  ultimoServicioEn: Date | null;

  @Prop({ default: 0 })
  totalServicios: number;

  /** Nombre y apellido sin tildes y en minúsculas, solo para buscar. */
  @Prop({ required: true, select: false })
  busqueda: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ClienteDocument = HydratedDocument<Cliente>;
export type ClienteLean = Cliente & { _id: Types.ObjectId };

export const ClienteSchema = SchemaFactory.createForClass(Cliente);

// Únicos solo entre activos: un cliente dado de baja no bloquea reutilizar su teléfono o cédula.
ClienteSchema.index(
  { telefono: 1 },
  { unique: true, partialFilterExpression: { activo: true, telefono: { $type: 'string' } } },
);
ClienteSchema.index(
  { cedula: 1 },
  { unique: true, partialFilterExpression: { activo: true, cedula: { $type: 'string' } } },
);
ClienteSchema.index({ activo: 1, apellido: 1, nombre: 1 });
