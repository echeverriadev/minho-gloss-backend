import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientesModule } from '../clientes/clientes.module.js';
import { TiposServicioModule } from '../tipos-servicio/tipos-servicio.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AtencionesController } from './atenciones.controller.js';
import { AtencionesService } from './atenciones.service.js';
import { Atencion, AtencionSchema } from './schemas/atencion.schema.js';
import { Contador, ContadorSchema } from './schemas/contador.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Atencion.name, schema: AtencionSchema },
      { name: Contador.name, schema: ContadorSchema },
    ]),
    ClientesModule,
    TiposServicioModule,
    UsuariosModule,
  ],
  controllers: [AtencionesController],
  providers: [AtencionesService],
  exports: [AtencionesService],
})
export class AtencionesModule {}
