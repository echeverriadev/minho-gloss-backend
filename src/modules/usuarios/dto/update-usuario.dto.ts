import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { ROLES, type Rol } from '../../../common/auth/roles.js';
import { Trim } from '../../../common/validation/transforms.js';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Ana Silva', minLength: 2, maxLength: 80 })
  @IsOptional()
  @Trim()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({ enum: ROLES, example: 'admin' })
  @IsOptional()
  @IsIn(ROLES, { message: 'El rol debe ser admin o empleado' })
  rol?: Rol;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser true o false' })
  activo?: boolean;
}
