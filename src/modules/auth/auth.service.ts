import { createHash, randomBytes } from 'node:crypto';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import type { JwtPayload, UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { MailService } from '../../common/mail/mail.service.js';
import { toId } from '../../common/mongo/to-id.js';
import type { AppConfig } from '../../config/configuration.js';
import { toSesion, UsuariosService } from '../usuarios/usuarios.service.js';
import type { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import type { LoginDto, LoginResponseDto } from './dto/login.dto.js';
import type { RestablecerPasswordDto } from './dto/recuperar-password.dto.js';
import { correoRecuperarPassword } from './plantillas/recuperar-password.js';

export const MENSAJE_CREDENCIALES = 'Correo o contraseña incorrectos';
export const MENSAJE_PASSWORD_ACTUAL = 'La contraseña actual no es correcta';
export const MENSAJE_ENLACE_INVALIDO = 'El enlace no es válido o ya venció, pide uno nuevo';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuariosService.findByEmailConPassword(dto.email);
    // Mismo mensaje para correo inexistente, contraseña incorrecta o usuario inactivo (spec auth).
    if (!usuario?.activo || !(await compare(dto.password, usuario.passwordHash))) {
      throw new UnauthorizedException(MENSAJE_CREDENCIALES);
    }
    const sesion = toSesion(usuario);
    const payload: JwtPayload = { sub: sesion.id, rol: sesion.rol, nombre: sesion.nombre };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: this.config.get('jwt', { infer: true }).expiresInSeconds,
      usuario: sesion,
    };
  }

  async cambiarPassword(sesion: UsuarioSesion, dto: CambiarPasswordDto): Promise<void> {
    const usuario = await this.usuariosService.findByIdConPassword(sesion.id);
    if (!usuario || !(await compare(dto.passwordActual, usuario.passwordHash))) {
      throw new BadRequestException(MENSAJE_PASSWORD_ACTUAL);
    }
    await this.usuariosService.setPassword(sesion.id, dto.passwordNueva);
  }

  /** Siempre termina sin error para no revelar qué correos están registrados. */
  async solicitarRecuperacion(email: string): Promise<void> {
    const usuario = await this.usuariosService.findByEmailConPassword(email);
    if (!usuario?.activo) {
      return;
    }
    const token = randomBytes(32).toString('hex');
    const minutos = this.config.get('resetPasswordExpiresMinutes', { infer: true });
    const venceEn = new Date(Date.now() + minutos * 60_000);
    await this.usuariosService.guardarTokenRecuperacion(usuario.id, hashToken(token), venceEn);

    const enlace = `${this.config.get('frontendUrl', { infer: true })}/restablecer-password?token=${token}`;
    try {
      await this.mailService.enviar(
        correoRecuperarPassword({ para: usuario.email, nombre: usuario.nombre, enlace, minutos }),
      );
    } catch (error) {
      // Se registra el fallo sin el token; la respuesta sigue siendo 204 para no revelar el correo.
      this.logger.error(
        `No se pudo enviar el correo de recuperación: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async restablecerPassword(dto: RestablecerPasswordDto): Promise<void> {
    const usuario = await this.usuariosService.findByTokenRecuperacion(
      hashToken(dto.token),
      new Date(),
    );
    if (!usuario) {
      throw new BadRequestException(MENSAJE_ENLACE_INVALIDO);
    }
    await this.usuariosService.setPassword(toId(usuario), dto.password);
  }
}
