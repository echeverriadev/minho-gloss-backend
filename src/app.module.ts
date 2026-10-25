import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard.js';
import { RolesGuard } from './common/auth/roles.guard.js';
import configuration, { type AppConfig } from './config/configuration.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientesModule } from './modules/clientes/clientes.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { TiposServicioModule } from './modules/tipos-servicio/tipos-servicio.module.js';
import { UsuariosModule } from './modules/usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        uri: config.get('mongoUri', { infer: true }),
      }),
    }),
    HealthModule,
    UsuariosModule,
    AuthModule,
    ClientesModule,
    TiposServicioModule,
  ],
  providers: [
    // Protegido por defecto: primero se exige sesión y luego el rol (spec auth).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
