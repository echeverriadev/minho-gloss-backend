import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt ignora lo que pasa de 72 bytes

/** Reglas de contraseña de `domain-model`, reutilizadas en todos los DTOs. */
export const PasswordRules = (campo = 'La contraseña') =>
  applyDecorators(
    IsString({ message: `${campo} debe ser un texto` }),
    MinLength(PASSWORD_MIN, { message: `${campo} debe tener al menos ${PASSWORD_MIN} caracteres` }),
    MaxLength(PASSWORD_MAX, {
      message: `${campo} no puede superar los ${PASSWORD_MAX} caracteres`,
    }),
  );

export class RestablecerPasswordUsuarioDto {
  @ApiProperty({ example: 'NuevaClave2026', minLength: PASSWORD_MIN })
  @PasswordRules()
  password: string;
}
