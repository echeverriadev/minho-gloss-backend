import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { AppConfig } from '../../config/configuration.js';
import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';
import { setCodigoPaisPorDefecto } from './dto/normalizar-telefono.transform.js';
import { Cliente, ClienteSchema } from './schemas/cliente.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cliente.name, schema: ClienteSchema }])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {
  constructor(config: ConfigService<AppConfig, true>) {
    setCodigoPaisPorDefecto(config.get('defaultCountryCode', { infer: true }));
  }
}
