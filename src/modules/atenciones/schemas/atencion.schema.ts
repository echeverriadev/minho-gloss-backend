import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import { TIPOS_VEHICULO, type TipoVehiculo } from '../../../common/vehiculos/tipos-vehiculo.js';

export const METODOS_PAGO = ['efectivo', 'tarjeta', 'mbway', 'transferencia', 'otro'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export const ESTADOS_ATENCION = ['completada', 'anulada'] as const;
export type EstadoAtencion = (typeof ESTADOS_ATENCION)[number];

export const CATEGORIAS_ITEM = ['servicio', 'extra', 'personalizado'] as const;
export type CategoriaItem = (typeof CATEGORIAS_ITEM)[number];

/** Un servicio prestado dentro de la atención, con nombre y precios copiados al registrar. */
@Schema({ _id: false })
export class ItemAtencion {
  @Prop({ type: Types.ObjectId, default: null })
  tipoServicioId: Types.ObjectId | null;

  @Prop({ type: String, required: true, trim: true })
  nombre: string;

  @Prop({ type: String, required: true, enum: CATEGORIAS_ITEM })
  categoria: CategoriaItem;

  /** Vacío en los servicios personalizados, que no están en el catálogo. */
  @Prop({ type: Number, default: null })
  precioLista: number | null;

  /** Precio cobrado, en céntimos. */
  @Prop({ type: Number, required: true })
  precio: number;
}

const ItemAtencionSchema = SchemaFactory.createForClass(ItemAtencion);

@Schema({ _id: false })
export class Anulacion {
  @Prop({ type: String, required: true, trim: true })
  motivo: string;

  @Prop({ type: Types.ObjectId, required: true })
  anuladoPor: Types.ObjectId;

  @Prop({ type: Date, required: true })
  anuladoEn: Date;
}

const AnulacionSchema = SchemaFactory.createForClass(Anulacion);

@Schema({ collection: 'atenciones', timestamps: true })
export class Atencion {
  @Prop({ type: Number, required: true })
  numero: number;

  @Prop({ type: Types.ObjectId, default: null })
  clienteId: Types.ObjectId | null;

  @Prop({ type: String, required: true, enum: TIPOS_VEHICULO })
  tipoVehiculo: TipoVehiculo;

  @Prop({ type: String, default: null })
  placa: string | null;

  @Prop({ type: [ItemAtencionSchema], required: true })
  items: ItemAtencion[];

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: String, required: true, enum: METODOS_PAGO })
  metodoPago: MetodoPago;

  @Prop({ type: Date, required: true })
  realizadoEn: Date;

  @Prop({ type: Types.ObjectId, required: true })
  registradoPor: Types.ObjectId;

  @Prop({ type: String, trim: true, default: null })
  notas: string | null;

  @Prop({ type: String, required: true, enum: ESTADOS_ATENCION, default: 'completada' })
  estado: EstadoAtencion;

  @Prop({ type: AnulacionSchema, default: null })
  anulacion: Anulacion | null;

  createdAt: Date;
  updatedAt: Date;
}

export type AtencionDocument = HydratedDocument<Atencion>;
export type AtencionLean = Atencion & { _id: Types.ObjectId };

export const AtencionSchema = SchemaFactory.createForClass(Atencion);

AtencionSchema.index({ numero: 1 }, { unique: true });
// Listado del día y métricas: por estado y fecha; historial: por cliente y fecha.
AtencionSchema.index({ estado: 1, realizadoEn: -1 });
AtencionSchema.index({ clienteId: 1, estado: 1, realizadoEn: -1 });
