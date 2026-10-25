import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { nuevoId } from '../../../test/utils/mock-query.js';
import type { MailService } from '../../common/mail/mail.service.js';
import type { AppConfig } from '../../config/configuration.js';
import type { UsuariosService } from '../usuarios/usuarios.service.js';
import {
  AuthService,
  hashToken,
  MENSAJE_CREDENCIALES,
  MENSAJE_ENLACE_INVALIDO,
  MENSAJE_PASSWORD_ACTUAL,
} from './auth.service.js';

const CONFIG: Partial<AppConfig> = {
  jwt: { secret: 'x'.repeat(32), expiresInSeconds: 43_200 },
  resetPasswordExpiresMinutes: 60,
  frontendUrl: 'http://localhost:5173',
};

async function usuarioConPassword(password: string, datos: Record<string, unknown> = {}) {
  const _id = nuevoId();
  return {
    _id,
    id: _id.toString(),
    nombre: 'Ana Silva',
    email: 'ana@minhogloss.pt',
    rol: 'empleado' as const,
    activo: true,
    passwordHash: await hash(password, 4),
    ...datos,
  };
}

function crear() {
  const usuarios = {
    findByEmailConPassword: vi.fn(),
    findByIdConPassword: vi.fn(),
    setPassword: vi.fn(),
    guardarTokenRecuperacion: vi.fn(),
    findByTokenRecuperacion: vi.fn(),
  };
  const jwt = { signAsync: vi.fn(() => Promise.resolve('token-firmado')) };
  const mail = { enviar: vi.fn(() => Promise.resolve()) };
  const config = { get: vi.fn((clave: keyof AppConfig) => CONFIG[clave]) };
  const servicio = new AuthService(
    usuarios as unknown as UsuariosService,
    jwt as unknown as JwtService,
    mail as unknown as MailService,
    config as unknown as ConfigService<AppConfig, true>,
  );
  return { servicio, usuarios, jwt, mail };
}

describe('AuthService', () => {
  describe('login', () => {
    it('devuelve el token y los datos del usuario sin la contraseña', async () => {
      const { servicio, usuarios, jwt } = crear();
      const usuario = await usuarioConPassword('ClaveSegura2026');
      usuarios.findByEmailConPassword.mockResolvedValue(usuario);

      const respuesta = await servicio.login({ email: usuario.email, password: 'ClaveSegura2026' });

      expect(respuesta).toEqual({
        accessToken: 'token-firmado',
        expiresIn: 43_200,
        usuario: { id: usuario.id, nombre: 'Ana Silva', email: usuario.email, rol: 'empleado' },
      });
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: usuario.id,
        rol: 'empleado',
        nombre: 'Ana Silva',
      });
    });

    it('rechaza una contraseña incorrecta con el mensaje genérico', async () => {
      const { servicio, usuarios } = crear();
      usuarios.findByEmailConPassword.mockResolvedValue(await usuarioConPassword('otra-clave'));

      await expect(
        servicio.login({ email: 'ana@minhogloss.pt', password: 'ClaveSegura2026' }),
      ).rejects.toThrow(new UnauthorizedException(MENSAJE_CREDENCIALES));
    });

    it('rechaza un correo inexistente con el mismo mensaje', async () => {
      const { servicio, usuarios } = crear();
      usuarios.findByEmailConPassword.mockResolvedValue(null);

      await expect(servicio.login({ email: 'nadie@x.pt', password: '12345678' })).rejects.toThrow(
        MENSAJE_CREDENCIALES,
      );
    });

    it('rechaza a un usuario desactivado aunque la contraseña sea correcta', async () => {
      const { servicio, usuarios } = crear();
      usuarios.findByEmailConPassword.mockResolvedValue(
        await usuarioConPassword('ClaveSegura2026', { activo: false }),
      );

      await expect(
        servicio.login({ email: 'ana@minhogloss.pt', password: 'ClaveSegura2026' }),
      ).rejects.toThrow(MENSAJE_CREDENCIALES);
    });
  });

  describe('cambiarPassword', () => {
    it('rechaza si la contraseña actual no coincide', async () => {
      const { servicio, usuarios } = crear();
      const usuario = await usuarioConPassword('ClaveSegura2026');
      usuarios.findByIdConPassword.mockResolvedValue(usuario);

      await expect(
        servicio.cambiarPassword(usuario, { passwordActual: 'mal', passwordNueva: 'Nueva2026!' }),
      ).rejects.toThrow(new BadRequestException(MENSAJE_PASSWORD_ACTUAL));
      expect(usuarios.setPassword).not.toHaveBeenCalled();
    });

    it('guarda la contraseña nueva si la actual es correcta', async () => {
      const { servicio, usuarios } = crear();
      const usuario = await usuarioConPassword('ClaveSegura2026');
      usuarios.findByIdConPassword.mockResolvedValue(usuario);

      await servicio.cambiarPassword(usuario, {
        passwordActual: 'ClaveSegura2026',
        passwordNueva: 'Nueva2026!',
      });

      expect(usuarios.setPassword).toHaveBeenCalledWith(usuario.id, 'Nueva2026!');
    });
  });

  describe('recuperación de contraseña', () => {
    it('no envía nada si el correo no existe', async () => {
      const { servicio, usuarios, mail } = crear();
      usuarios.findByEmailConPassword.mockResolvedValue(null);

      await servicio.solicitarRecuperacion('nadie@x.pt');

      expect(mail.enviar).not.toHaveBeenCalled();
      expect(usuarios.guardarTokenRecuperacion).not.toHaveBeenCalled();
    });

    it('guarda el hash del token y envía el enlace por correo', async () => {
      const { servicio, usuarios, mail } = crear();
      const usuario = await usuarioConPassword('ClaveSegura2026');
      usuarios.findByEmailConPassword.mockResolvedValue(usuario);

      await servicio.solicitarRecuperacion(usuario.email);

      const [{ para, texto }] = mail.enviar.mock.calls[0] as unknown as [
        { para: string; texto: string },
      ];
      const token = /token=([a-f0-9]{64})/.exec(texto)?.[1];
      expect(para).toBe(usuario.email);
      expect(texto).toContain('http://localhost:5173/restablecer-password?token=');
      expect(token).toBeDefined();
      const [id, tokenHash, venceEn] = usuarios.guardarTokenRecuperacion.mock.calls[0] as [
        string,
        string,
        Date,
      ];
      expect(id).toBe(usuario.id);
      expect(tokenHash).toBe(hashToken(token ?? ''));
      expect(tokenHash).not.toBe(token);
      expect(venceEn.getTime()).toBeGreaterThan(Date.now() + 59 * 60_000);
    });

    it('no falla si el correo no se pudo enviar', async () => {
      const { servicio, usuarios, mail } = crear();
      usuarios.findByEmailConPassword.mockResolvedValue(await usuarioConPassword('x'));
      mail.enviar.mockRejectedValue(new Error('SMTP caído'));

      await expect(servicio.solicitarRecuperacion('ana@minhogloss.pt')).resolves.toBeUndefined();
    });

    it('rechaza un token inexistente o vencido', async () => {
      const { servicio, usuarios } = crear();
      usuarios.findByTokenRecuperacion.mockResolvedValue(null);

      await expect(
        servicio.restablecerPassword({ token: 'abc', password: 'Nueva2026!' }),
      ).rejects.toThrow(MENSAJE_ENLACE_INVALIDO);
    });

    it('cambia la contraseña con un token vigente', async () => {
      const { servicio, usuarios } = crear();
      const usuario = await usuarioConPassword('x');
      usuarios.findByTokenRecuperacion.mockResolvedValue(usuario);

      await servicio.restablecerPassword({ token: 'abc', password: 'Nueva2026!' });

      expect(usuarios.findByTokenRecuperacion).toHaveBeenCalledWith(
        hashToken('abc'),
        expect.any(Date),
      );
      expect(usuarios.setPassword).toHaveBeenCalledWith(usuario.id, 'Nueva2026!');
    });
  });
});
