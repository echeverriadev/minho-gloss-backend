import { ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import type { Model } from 'mongoose';
import { nuevoId, query } from '../../../test/utils/mock-query.js';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import type { AppConfig } from '../../config/configuration.js';
import type { Usuario, UsuarioLean } from './schemas/usuario.schema.js';
import {
  MENSAJE_AUTO_DESACTIVAR,
  MENSAJE_EMAIL_REPETIDO,
  MENSAJE_ULTIMO_ADMIN,
  UsuariosService,
} from './usuarios.service.js';

function crearModelo() {
  return {
    exists: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    updateOne: vi.fn(() => query({ acknowledged: true })),
  };
}

function crearUsuario(datos: Partial<UsuarioLean> = {}): UsuarioLean {
  const ahora = new Date();
  return {
    _id: nuevoId(),
    nombre: 'Ana Silva',
    email: 'ana@minhogloss.pt',
    passwordHash: 'hash',
    rol: 'empleado',
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
    ...datos,
  };
}

function crearServicio(
  modelo: ReturnType<typeof crearModelo>,
  adminInicial: AppConfig['adminInicial'] = { nombre: 'Administrador' },
) {
  const config = { get: vi.fn(() => adminInicial) };
  return new UsuariosService(
    modelo as unknown as Model<Usuario>,
    config as unknown as ConfigService<AppConfig, true>,
  );
}

function sesionDe(usuario: UsuarioLean): UsuarioSesion {
  return {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    preferencias: { idioma: 'es', tema: 'claro' },
  };
}

describe('UsuariosService', () => {
  it('rechaza crear un usuario con un correo repetido', async () => {
    const modelo = crearModelo();
    modelo.exists.mockReturnValue(query({ _id: nuevoId() }));
    const servicio = crearServicio(modelo);

    await expect(
      servicio.create({
        nombre: 'Ana',
        email: 'ana@minhogloss.pt',
        password: '12345678',
        rol: 'empleado',
      }),
    ).rejects.toThrow(MENSAJE_EMAIL_REPETIDO);
    expect(modelo.create).not.toHaveBeenCalled();
  });

  it('guarda solo el hash de la contraseña al crear', async () => {
    const modelo = crearModelo();
    modelo.exists.mockReturnValue(query(null));
    modelo.create.mockImplementation((datos: Partial<UsuarioLean>) =>
      Promise.resolve({ toObject: () => crearUsuario(datos) }),
    );
    const servicio = crearServicio(modelo);

    const creado = await servicio.create({
      nombre: 'Ana',
      email: 'ana@minhogloss.pt',
      password: 'ClaveSegura2026',
      rol: 'empleado',
    });

    const guardado = modelo.create.mock.calls[0][0] as { passwordHash: string; password?: string };
    expect(guardado.password).toBeUndefined();
    expect(await compare('ClaveSegura2026', guardado.passwordHash)).toBe(true);
    expect(creado).not.toHaveProperty('passwordHash');
  });

  it('no deja quitar el rol al último admin activo', async () => {
    const modelo = crearModelo();
    const admin = crearUsuario({ rol: 'admin' });
    modelo.findById.mockReturnValue(query(admin));
    modelo.countDocuments.mockReturnValue(query(0));
    const servicio = crearServicio(modelo);

    await expect(
      servicio.update(admin._id.toString(), { rol: 'empleado' }, sesionDe(admin)),
    ).rejects.toThrow(MENSAJE_ULTIMO_ADMIN);
  });

  it('permite quitar el rol a un admin si queda otro activo', async () => {
    const modelo = crearModelo();
    const admin = crearUsuario({ rol: 'admin' });
    modelo.findById.mockReturnValue(query(admin));
    modelo.countDocuments.mockReturnValue(query(1));
    modelo.findByIdAndUpdate.mockReturnValue(query({ ...admin, rol: 'empleado' }));
    const servicio = crearServicio(modelo);

    const actualizado = await servicio.update(
      admin._id.toString(),
      { rol: 'empleado' },
      sesionDe(crearUsuario({ rol: 'admin' })),
    );
    expect(actualizado.rol).toBe('empleado');
  });

  it('no deja que un admin se desactive a sí mismo', async () => {
    const modelo = crearModelo();
    const admin = crearUsuario({ rol: 'admin' });
    modelo.findById.mockReturnValue(query(admin));
    const servicio = crearServicio(modelo);

    await expect(servicio.remove(admin._id.toString(), sesionDe(admin))).rejects.toThrow(
      MENSAJE_AUTO_DESACTIVAR,
    );
  });

  it('desactiva a un empleado', async () => {
    const modelo = crearModelo();
    const empleado = crearUsuario();
    modelo.findById.mockReturnValue(query(empleado));
    modelo.findByIdAndUpdate.mockReturnValue(query({ ...empleado, activo: false }));
    const servicio = crearServicio(modelo);

    await servicio.remove(empleado._id.toString(), sesionDe(crearUsuario({ rol: 'admin' })));
    expect(modelo.findByIdAndUpdate).toHaveBeenCalledWith(
      empleado._id.toString(),
      { $set: { activo: false } },
      expect.anything(),
    );
  });

  it('restablece la contraseña e invalida el enlace de recuperación', async () => {
    const modelo = crearModelo();
    const empleado = crearUsuario();
    modelo.findById.mockReturnValue(query(empleado));
    const servicio = crearServicio(modelo);

    await servicio.restablecerPassword(empleado._id.toString(), 'NuevaClave2026');

    const [, cambios] = modelo.updateOne.mock.calls[0] as unknown as [
      unknown,
      { $set: { passwordHash: string }; $unset: Record<string, 1> },
    ];
    expect(await compare('NuevaClave2026', cambios.$set.passwordHash)).toBe(true);
    expect(cambios.$unset).toEqual({ resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 });
  });

  it('crea el admin inicial solo si no hay usuarios', async () => {
    const modelo = crearModelo();
    modelo.countDocuments.mockReturnValue(query(0));
    const servicio = crearServicio(modelo, {
      email: 'Admin@MinhoGloss.local',
      password: 'MinhoGloss2026',
      nombre: 'Administrador',
    });

    await servicio.onApplicationBootstrap();

    expect(modelo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'admin@minhogloss.local', rol: 'admin' }),
    );
  });

  it('no crea el admin inicial si ya hay usuarios', async () => {
    const modelo = crearModelo();
    modelo.countDocuments.mockReturnValue(query(3));
    const servicio = crearServicio(modelo, {
      email: 'admin@minhogloss.local',
      password: 'MinhoGloss2026',
      nombre: 'Administrador',
    });

    await servicio.onApplicationBootstrap();

    expect(modelo.create).not.toHaveBeenCalled();
  });

  it('lanza ConflictException con el último admin al desactivarlo desde otro admin', async () => {
    const modelo = crearModelo();
    const admin = crearUsuario({ rol: 'admin' });
    modelo.findById.mockReturnValue(query(admin));
    modelo.countDocuments.mockReturnValue(query(0));
    const servicio = crearServicio(modelo);

    await expect(
      servicio.update(
        admin._id.toString(),
        { activo: false },
        sesionDe(crearUsuario({ rol: 'admin', activo: false })),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
