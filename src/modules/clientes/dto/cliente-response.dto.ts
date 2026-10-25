import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toId } from '../../../common/mongo/to-id.js';
import type { ClienteLean } from '../schemas/cliente.schema.js';

export class ClienteResponseDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'José' })
  nombre: string;

  @ApiProperty({ example: 'Pereira' })
  apellido: string;

  @ApiProperty({ example: '123456789', nullable: true, type: String })
  cedula: string | null;

  @ApiProperty({ example: '+351912345678', nullable: true, type: String })
  telefono: string | null;

  @ApiProperty({ example: 'jose.pereira@example.com', nullable: true, type: String })
  email: string | null;

  @ApiProperty({ example: 'Rua do Souto 25, 4700-329 Braga', nullable: true, type: String })
  direccion: string | null;

  @ApiProperty({ example: '1985-04-12', nullable: true, type: String })
  fechaNacimiento: string | null;

  @ApiProperty({ example: true })
  aceptaContacto: boolean;

  @ApiPropertyOptional({
    example: 'Prefiere que lo llamen por la tarde',
    nullable: true,
    type: String,
  })
  notas: string | null;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: false })
  anonimizado: boolean;

  @ApiProperty({ example: '2026-10-20T15:30:00.000Z', nullable: true, type: String })
  ultimoServicioEn: string | null;

  @ApiProperty({ example: 4 })
  totalServicios: number;

  @ApiProperty({ example: '2026-10-24T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-24T10:00:00.000Z' })
  updatedAt: string;

  static from(cliente: ClienteLean): ClienteResponseDto {
    return {
      id: toId(cliente),
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      cedula: cliente.cedula ?? null,
      telefono: cliente.telefono ?? null,
      email: cliente.email ?? null,
      direccion: cliente.direccion ?? null,
      fechaNacimiento: cliente.fechaNacimiento ?? null,
      aceptaContacto: cliente.aceptaContacto,
      notas: cliente.notas ?? null,
      activo: cliente.activo,
      anonimizado: cliente.anonimizado,
      ultimoServicioEn: cliente.ultimoServicioEn?.toISOString() ?? null,
      totalServicios: cliente.totalServicios,
      createdAt: cliente.createdAt.toISOString(),
      updatedAt: cliente.updatedAt.toISOString(),
    };
  }
}

export class ClientesPaginadosDto {
  @ApiProperty({ type: [ClienteResponseDto] })
  items: ClienteResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class ClienteConflictoDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'Conflict' })
  error: string;

  @ApiProperty({ example: 'La cédula ya está registrada para Ana Silva' })
  message: string;

  @ApiProperty({ enum: ['telefono', 'cedula'], example: 'cedula' })
  campo: 'telefono' | 'cedula';

  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  clienteId: string;
}
