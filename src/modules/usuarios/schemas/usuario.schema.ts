import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { ROLES, type Rol } from '../../../common/auth/roles.js';
import {
  IDIOMAS,
  type Idioma,
  type Preferencias as PreferenciasUsuario,
  TEMAS,
  type Tema,
} from '../../../common/preferencias/preferencias.js';

@Schema({ _id: false })
export class Preferencias implements PreferenciasUsuario {
  @Prop({ type: String, enum: IDIOMAS, default: 'es' })
  idioma: Idioma;

  @Prop({ type: String, enum: TEMAS, default: 'claro' })
  tema: Tema;
}

const PreferenciasSchema = SchemaFactory.createForClass(Preferencias);

@Schema({ collection: 'usuarios', timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // Nunca se devuelve por defecto: hay que pedirlo con `.select('+passwordHash')`.
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: ROLES })
  rol: Rol;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: PreferenciasSchema, default: () => ({}) })
  preferencias?: Preferencias;

  @Prop({ type: String, select: false, index: { sparse: true } })
  resetPasswordTokenHash?: string | null;

  @Prop({ type: Date, select: false })
  resetPasswordExpiresAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type UsuarioDocument = HydratedDocument<Usuario>;

/** Usuario leído con `.lean()`. */
export type UsuarioLean = Usuario & { _id: Types.ObjectId };

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
