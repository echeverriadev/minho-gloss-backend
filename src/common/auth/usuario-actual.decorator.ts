import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UsuarioSesion } from './usuario-sesion.js';

export interface RequestConSesion extends Request {
  user?: UsuarioSesion;
}

/** Entrega al controlador el usuario de la sesión. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioSesion | undefined =>
    ctx.switchToHttp().getRequest<RequestConSesion>().user,
);
