import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoServicio, TipoServicioSchema } from './schemas/tipo-servicio.schema.js';
import { TiposServicioController } from './tipos-servicio.controller.js';
import { TiposServicioService } from './tipos-servicio.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: TipoServicio.name, schema: TipoServicioSchema }])],
  controllers: [TiposServicioController],
  providers: [TiposServicioService],
  exports: [TiposServicioService],
})
export class TiposServicioModule {}
