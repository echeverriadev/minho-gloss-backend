export const ROLES = ['admin', 'empleado'] as const;
export type Rol = (typeof ROLES)[number];
