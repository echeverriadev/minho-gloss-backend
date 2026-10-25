import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import type { Connection, Model } from 'mongoose';
import { AppModule } from '../../src/app.module.js';
import { configurarApp } from '../../src/app.setup.js';
import type { Rol } from '../../src/common/auth/roles.js';
import { type MensajeCorreo, MailService } from '../../src/common/mail/mail.service.js';
import { Usuario } from '../../src/modules/usuarios/schemas/usuario.schema.js';

export interface AppDePrueba {
  app: INestApplication;
  correos: MensajeCorreo[];
  crearUsuario: (datos: {
    email: string;
    password?: string;
    rol?: Rol;
    activo?: boolean;
  }) => Promise<{ id: string; token: string }>;
  limpiar: () => Promise<void>;
  cerrar: () => Promise<void>;
}

/** Levanta la API completa contra la base de pruebas, con el correo capturado en memoria. */
export async function crearAppDePrueba(): Promise<AppDePrueba> {
  const correos: MensajeCorreo[] = [];
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue({
      enviar: (mensaje: MensajeCorreo) => {
        correos.push(mensaje);
        return Promise.resolve();
      },
    })
    .compile();

  const app = moduleRef.createNestApplication();
  configurarApp(app);
  await app.init();

  const connection = moduleRef.get<Connection>(getConnectionToken());
  const usuarioModel = moduleRef.get<Model<Usuario>>(getModelToken(Usuario.name));
  const jwt = moduleRef.get(JwtService);

  const limpiar = async () => {
    correos.length = 0;
    await Promise.all(
      Object.values(connection.collections).map((coleccion) => coleccion.deleteMany({})),
    );
  };
  await limpiar();
  await Promise.all(Object.values(connection.models).map((modelo) => modelo.syncIndexes()));

  return {
    app,
    correos,
    limpiar,
    crearUsuario: async ({
      email,
      password = 'ClaveSegura2026',
      rol = 'empleado',
      activo = true,
    }) => {
      const usuario = await usuarioModel.create({
        nombre: email.split('@')[0],
        email,
        passwordHash: await hash(password, 4),
        rol,
        activo,
      });
      const id = usuario.id;
      return { id, token: await jwt.signAsync({ sub: id, rol, nombre: usuario.nombre }) };
    },
    cerrar: () => app.close(),
  };
}
