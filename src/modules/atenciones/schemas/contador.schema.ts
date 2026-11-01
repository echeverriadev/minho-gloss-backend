import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Secuencias numéricas (por ejemplo, el número de cada atención). El `_id` es el nombre. */
@Schema({ collection: 'contadores', versionKey: false })
export class Contador {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: Number, required: true, default: 0 })
  valor: number;
}

export const ContadorSchema = SchemaFactory.createForClass(Contador);
