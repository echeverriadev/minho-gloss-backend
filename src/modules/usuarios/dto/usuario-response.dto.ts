import { ApiProperty } from '@nestjs/swagger';
import { ROLES, type Rol } from '../../../common/auth/roles.js';
import { toId } from '../../../common/mongo/to-id.js';
import type { UsuarioLean } from '../schemas/usuario.schema.js';

export class UsuarioResponseDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'Ana Silva' })
  nombre: string;

  @ApiProperty({ example: 'ana@minhogloss.pt' })
  email: string;

  @ApiProperty({ enum: ROLES, example: 'empleado' })
  rol: Rol;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: '2026-10-24T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-24T10:00:00.000Z' })
  updatedAt: string;

  static from(usuario: UsuarioLean): UsuarioResponseDto {
    return {
      id: toId(usuario),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
      createdAt: usuario.createdAt.toISOString(),
      updatedAt: usuario.updatedAt.toISOString(),
    };
  }
}

export class UsuariosPaginadosDto {
  @ApiProperty({ type: [UsuarioResponseDto] })
  items: UsuarioResponseDto[];

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
