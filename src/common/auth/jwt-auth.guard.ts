import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import type { RequestConSesion } from './usuario-actual.decorator.js';
import { type JwtPayload, SesionLookup } from './usuario-sesion.js';

export const MENSAJE_SIN_SESION = 'Debes iniciar sesión';
export const MENSAJE_SESION_VENCIDA = 'La sesión venció, inicia sesión de nuevo';
export const MENSAJE_SESION_INVALIDA = 'La sesión no es válida, inicia sesión de nuevo';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly sesionLookup: SesionLookup,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConSesion>();
    const token = extraerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException(MENSAJE_SIN_SESION);
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof TokenExpiredError ? MENSAJE_SESION_VENCIDA : MENSAJE_SESION_INVALIDA,
      );
    }

    // Se consulta la base en cada petición para que desactivar a un usuario corte su sesión al instante.
    const usuario = await this.sesionLookup.findSesion(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException(MENSAJE_SESION_INVALIDA);
    }
    request.user = usuario;
    return true;
  }
}

function extraerToken(header: string | undefined): string | undefined {
  const [tipo, token] = header?.split(' ') ?? [];
  return tipo === 'Bearer' && token ? token : undefined;
}
