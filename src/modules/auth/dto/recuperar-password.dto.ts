import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim, TrimLowercase } from '../../../common/validation/transforms.js';
import { PASSWORD_MIN, PasswordRules } from '../../usuarios/dto/password.dto.js';

export class RecuperarPasswordDto {
  @ApiProperty({ example: 'ana@minhogloss.pt' })
  @TrimLowercase()
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;
}

export class RestablecerPasswordDto {
  @ApiProperty({ description: 'Token recibido en el enlace del correo', example: 'b3f1c0...' })
  @Trim()
  @IsString({ message: 'El token debe ser un texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @MaxLength(200, { message: 'El token no es válido' })
  token: string;

  @ApiProperty({ example: 'ClaveNueva2026', minLength: PASSWORD_MIN })
  @PasswordRules()
  password: string;
}
