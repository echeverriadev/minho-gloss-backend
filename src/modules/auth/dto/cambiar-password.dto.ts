import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PASSWORD_MIN, PasswordRules } from '../../usuarios/dto/password.dto.js';

export class CambiarPasswordDto {
  @ApiProperty({ example: 'ClaveActual2026' })
  @IsString({ message: 'La contraseña actual debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  passwordActual: string;

  @ApiProperty({ example: 'ClaveNueva2026', minLength: PASSWORD_MIN })
  @PasswordRules('La contraseña nueva')
  passwordNueva: string;
}
