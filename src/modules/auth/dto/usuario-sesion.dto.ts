import { ApiProperty } from '@nestjs/swagger';
import { ROLES, type Rol } from '../../../common/auth/roles.js';
import { PreferenciasDto } from './preferencias.dto.js';

export class UsuarioSesionDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'Administrador' })
  nombre: string;

  @ApiProperty({ example: 'admin@minhogloss.local' })
  email: string;

  @ApiProperty({ enum: ROLES, example: 'admin' })
  rol: Rol;

  @ApiProperty({ type: PreferenciasDto })
  preferencias: PreferenciasDto;
}
