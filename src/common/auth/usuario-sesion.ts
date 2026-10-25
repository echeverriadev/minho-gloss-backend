import type { Preferencias } from '../preferencias/preferencias.js';
import type { Rol } from './roles.js';

/** Usuario autenticado que el `JwtAuthGuard` deja en la petición. */
export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  preferencias: Preferencias;
}

/** Contenido del token de acceso (spec auth: payload mínimo). */
export interface JwtPayload {
  sub: string;
  rol: Rol;
  nombre: string;
}

/** Lo que el guard necesita para validar que la sesión sigue vigente. */
export abstract class SesionLookup {
  abstract findSesion(id: string): Promise<UsuarioSesion | null>;
}
