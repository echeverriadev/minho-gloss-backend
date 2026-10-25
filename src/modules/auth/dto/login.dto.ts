import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TrimLowercase } from '../../../common/validation/transforms.js';
import { UsuarioSesionDto } from './usuario-sesion.dto.js';

export class LoginDto {
  @ApiProperty({ example: 'admin@minhogloss.local' })
  @TrimLowercase()
  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @ApiProperty({ example: 'MinhoGloss2026' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 43_200, description: 'Segundos hasta que vence el token' })
  expiresIn: number;

  @ApiProperty({ type: UsuarioSesionDto })
  usuario: UsuarioSesionDto;
}
