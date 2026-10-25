import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import {
  JwtAuthGuard,
  MENSAJE_SESION_INVALIDA,
  MENSAJE_SESION_VENCIDA,
  MENSAJE_SIN_SESION,
} from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import type { SesionLookup, UsuarioSesion } from './usuario-sesion.js';

const USUARIO: UsuarioSesion = {
  id: '1',
  nombre: 'Ana',
  email: 'ana@x.pt',
  rol: 'empleado',
  preferencias: { idioma: 'es', tema: 'claro' },
};

function contexto(request: Record<string, unknown>): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => Object,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function crearGuard(opciones: {
  publico?: boolean;
  verify?: () => Promise<unknown>;
  usuario?: UsuarioSesion | null;
}) {
  const reflector = { getAllAndOverride: vi.fn(() => opciones.publico) } as unknown as Reflector;
  const jwt = {
    verifyAsync: vi.fn(opciones.verify ?? (() => Promise.resolve({ sub: '1' }))),
  } as unknown as JwtService;
  const lookup = {
    findSesion: vi.fn(() =>
      Promise.resolve(opciones.usuario === undefined ? USUARIO : opciones.usuario),
    ),
  } as unknown as SesionLookup;
  return new JwtAuthGuard(reflector, jwt, lookup);
}

describe('JwtAuthGuard', () => {
  it('deja pasar los endpoints públicos sin token', async () => {
    await expect(
      crearGuard({ publico: true }).canActivate(contexto({ headers: {} })),
    ).resolves.toBe(true);
  });

  it('rechaza una petición sin token', async () => {
    await expect(crearGuard({}).canActivate(contexto({ headers: {} }))).rejects.toThrow(
      new UnauthorizedException(MENSAJE_SIN_SESION),
    );
  });

  it('avisa cuando la sesión venció', async () => {
    const guard = crearGuard({
      verify: () => Promise.reject(new TokenExpiredError('jwt expired', new Date())),
    });
    await expect(
      guard.canActivate(contexto({ headers: { authorization: 'Bearer abc' } })),
    ).rejects.toThrow(MENSAJE_SESION_VENCIDA);
  });

  it('rechaza el token de un usuario desactivado', async () => {
    const guard = crearGuard({ usuario: null });
    await expect(
      guard.canActivate(contexto({ headers: { authorization: 'Bearer abc' } })),
    ).rejects.toThrow(MENSAJE_SESION_INVALIDA);
  });

  it('deja el usuario de la sesión en la petición', async () => {
    const request: Record<string, unknown> = { headers: { authorization: 'Bearer abc' } };
    await crearGuard({}).canActivate(contexto(request));
    expect(request.user).toEqual(USUARIO);
  });
});

function crearRolesGuard(roles: string[] | undefined) {
  return new RolesGuard({ getAllAndOverride: () => roles } as unknown as Reflector);
}

describe('RolesGuard', () => {
  it('permite cualquier rol si el endpoint no declara roles', () => {
    expect(crearRolesGuard(undefined).canActivate(contexto({ user: USUARIO }))).toBe(true);
  });

  it('rechaza a un empleado en un endpoint de admin', () => {
    expect(() => crearRolesGuard(['admin']).canActivate(contexto({ user: USUARIO }))).toThrow(
      ForbiddenException,
    );
  });

  it('permite al admin en un endpoint de admin', () => {
    expect(
      crearRolesGuard(['admin']).canActivate(contexto({ user: { ...USUARIO, rol: 'admin' } })),
    ).toBe(true);
  });
});
