import { SetMetadata } from '@nestjs/common';
import type { Rol } from './roles.js';

export const ROLES_KEY = 'roles';

/** Restringe un endpoint a los roles indicados. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
