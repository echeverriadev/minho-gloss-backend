import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, Length, MaxLength } from 'class-validator';
import { ROLES, type Rol } from '../../../common/auth/roles.js';
import { Trim, TrimLowercase } from '../../../common/validation/transforms.js';
import { PASSWORD_MIN, PasswordRules } from './password.dto.js';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana Silva', minLength: 2, maxLength: 80 })
  @Trim()
  @IsString({ message: 'El nombre debe ser un texto' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'ana@minhogloss.pt' })
  @TrimLowercase()
  @IsEmail({}, { message: 'El correo no es válido' })
  @MaxLength(120, { message: 'El correo no puede superar los 120 caracteres' })
  email: string;

  @ApiProperty({ example: 'ClaveSegura2026', minLength: PASSWORD_MIN })
  @PasswordRules()
  password: string;

  @ApiProperty({ enum: ROLES, example: 'empleado' })
  @IsIn(ROLES, { message: 'El rol debe ser admin o empleado' })
  rol: Rol;
}
