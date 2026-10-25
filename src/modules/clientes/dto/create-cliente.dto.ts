import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AceptaContactoRules,
  CedulaRules,
  DireccionRules,
  EmailRules,
  FechaNacimientoRules,
  NombreRules,
  NotasRules,
  TelefonoRules,
} from './cliente-fields.js';

export class CreateClienteDto {
  @ApiProperty({ example: 'José', minLength: 2, maxLength: 60 })
  @NombreRules('nombre')
  nombre: string;

  @ApiProperty({ example: 'Pereira', minLength: 2, maxLength: 60 })
  @NombreRules('apellido')
  apellido: string;

  @ApiProperty({
    example: '123456789',
    description: 'NIF, Cartão de Cidadão u otro documento; se guarda sin espacios ni guiones',
  })
  @CedulaRules()
  cedula: string;

  @ApiProperty({
    example: '912 345 678',
    description: 'Teléfono celular; sin código de país se asume +351',
  })
  @TelefonoRules()
  telefono: string;

  @ApiProperty({ example: 'jose.pereira@example.com' })
  @EmailRules()
  email: string;

  @ApiProperty({ example: 'Rua do Souto 25, 4700-329 Braga', minLength: 5, maxLength: 200 })
  @DireccionRules()
  direccion: string;

  @ApiProperty({ example: '1985-04-12', description: 'Fecha AAAA-MM-DD' })
  @FechaNacimientoRules()
  fechaNacimiento: string;

  @ApiProperty({ example: true, description: 'Autoriza recibir mensajes de post-venta (RGPD)' })
  @AceptaContactoRules()
  aceptaContacto: boolean;

  @ApiPropertyOptional({ example: 'Prefiere que lo llamen por la tarde', maxLength: 500 })
  @NotasRules()
  notas?: string;
}
