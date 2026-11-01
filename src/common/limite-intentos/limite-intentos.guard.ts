import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';

export const LIMITE_INTENTOS_KEY = 'limiteIntentos';
export const MENSAJE_LIMITE_INTENTOS = 'Demasiados intentos, espera un minuto';

export interface LimiteIntentos {
  limite: number;
  ventanaMs: number;
}

interface Registro {
  intentos: number;
  reiniciaEn: number;
}

/** Permite como mucho `limite` pedidos por IP cada `ventanaMs` en el endpoint marcado. */
export const LimitarIntentos = (limite: number, ventanaMs: number) =>
  SetMetadata(LIMITE_INTENTOS_KEY, { limite, ventanaMs } satisfies LimiteIntentos);

/**
 * Límite de intentos en memoria, por endpoint e IP. Reemplaza a `@nestjs/throttler`, que es
 * CommonJS y no carga en Vercel junto a NestJS 12 (solo ESM). Con una sola instancia de la API no
 * hace falta Redis (design de add-auth); en Vercel cada instancia lleva su propia cuenta.
 */
@Injectable()
export class LimiteIntentosGuard implements CanActivate {
  private readonly registros = new Map<string, Registro>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const regla = this.reflector.get<LimiteIntentos | undefined>(
      LIMITE_INTENTOS_KEY,
      context.getHandler(),
    );
    if (!regla) {
      return true;
    }
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const ahora = Date.now();
    this.limpiarVencidos(ahora);

    const clave = `${context.getClass().name}.${context.getHandler().name}:${req.ip ?? ''}`;
    const registro = this.registros.get(clave);
    if (!registro || registro.reiniciaEn <= ahora) {
      this.registros.set(clave, { intentos: 1, reiniciaEn: ahora + regla.ventanaMs });
      return true;
    }
    registro.intentos += 1;
    if (registro.intentos > regla.limite) {
      const segundos = Math.ceil((registro.reiniciaEn - ahora) / 1000);
      http.getResponse<Response>().setHeader('Retry-After', String(segundos));
      throw new HttpException(MENSAJE_LIMITE_INTENTOS, HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private limpiarVencidos(ahora: number): void {
    for (const [clave, registro] of this.registros) {
      if (registro.reiniciaEn <= ahora) {
        this.registros.delete(clave);
      }
    }
  }
}
