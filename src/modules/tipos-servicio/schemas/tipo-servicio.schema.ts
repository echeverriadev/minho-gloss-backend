import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import type { TipoVehiculo } from '../../../common/vehiculos/tipos-vehiculo.js';

export const CATEGORIAS_SERVICIO = ['servicio', 'extra'] as const;
export type CategoriaServicio = (typeof CATEGORIAS_SERVICIO)[number];

export const MODOS_PRECIO = ['por-vehiculo', 'unico'] as const;
export type ModoPrecio = (typeof MODOS_PRECIO)[number];

export type PreciosPorVehiculo = Record<TipoVehiculo, number>;

@Schema({ _id: false })
export class Precios implements PreciosPorVehiculo {
  @Prop({ type: Number, required: true })
  ligeiro: number;

  @Prop({ type: Number, required: true })
  suv: number;

  @Prop({ type: Number, required: true })
  monovolume: number;

  @Prop({ type: Number, required: true })
  carrinha: number;
}

const PreciosSchema = SchemaFactory.createForClass(Precios);

@Schema({ collection: 'tipos_servicio', timestamps: true })
export class TipoServicio {
  @Prop({ type: String, required: true, trim: true })
  nombre: string;

  /** Nombre en minúsculas, para que la unicidad no distinga mayúsculas. */
  @Prop({ type: String, required: true, select: false })
  nombreNormalizado: string;

  @Prop({ type: String, trim: true })
  descripcion?: string | null;

  @Prop({ type: String, required: true, enum: CATEGORIAS_SERVICIO })
  categoria: CategoriaServicio;

  @Prop({ type: String, required: true, enum: MODOS_PRECIO })
  modoPrecio: ModoPrecio;

  @Prop({ type: PreciosSchema })
  precios?: Precios | null;

  @Prop({ type: Number })
  precioUnico?: number | null;

  @Prop({ type: Number, default: 0 })
  orden: number;

  @Prop({ type: Boolean, default: true })
  activo: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type TipoServicioDocument = HydratedDocument<TipoServicio>;
export type TipoServicioLean = TipoServicio & { _id: Types.ObjectId };

export const TipoServicioSchema = SchemaFactory.createForClass(TipoServicio);

// Único solo entre activos: un servicio dado de baja libera su nombre.
TipoServicioSchema.index(
  { nombreNormalizado: 1 },
  { unique: true, partialFilterExpression: { activo: true } },
);
TipoServicioSchema.index({ activo: 1, categoria: -1, orden: 1, nombre: 1 });
