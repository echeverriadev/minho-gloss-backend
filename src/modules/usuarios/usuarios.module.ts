import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SesionLookup } from '../../common/auth/usuario-sesion.js';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])],
  controllers: [UsuariosController],
  providers: [UsuariosService, { provide: SesionLookup, useExisting: UsuariosService }],
  exports: [UsuariosService, SesionLookup],
})
export class UsuariosModule {}
