import { ApiProperty } from '@nestjs/swagger';
import { toId } from '../../../common/mongo/to-id.js';
import {
  CATEGORIAS_SERVICIO,
  type CategoriaServicio,
  MODOS_PRECIO,
  type ModoPrecio,
  type PreciosPorVehiculo,
  type TipoServicioLean,
} from '../schemas/tipo-servicio.schema.js';

export class PreciosResponseDto implements PreciosPorVehiculo {
  @ApiProperty({ example: 1700 })
  ligeiro: number;

  @ApiProperty({ example: 2000 })
  suv: number;

  @ApiProperty({ example: 2500 })
  monovolume: number;

  @ApiProperty({ example: 3000 })
  carrinha: number;
}

export class TipoServicioResponseDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'EXPRESS GLOSS' })
  nombre: string;

  @ApiProperty({ example: 'Lavagem rápida e eficiente', nullable: true, type: String })
  descripcion: string | null;

  @ApiProperty({ enum: CATEGORIAS_SERVICIO, example: 'servicio' })
  categoria: CategoriaServicio;

  @ApiProperty({ enum: MODOS_PRECIO, example: 'por-vehiculo' })
  modoPrecio: ModoPrecio;

  @ApiProperty({ type: PreciosResponseDto, nullable: true })
  precios: PreciosResponseDto | null;

  @ApiProperty({ example: null, nullable: true, type: Number })
  precioUnico: number | null;

  @ApiProperty({ example: 1 })
  orden: number;

  @ApiProperty({ example: true })
  activo: boolean;

  @ApiProperty({ example: '2026-10-25T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-25T10:00:00.000Z' })
  updatedAt: string;

  static from(tipo: TipoServicioLean): TipoServicioResponseDto {
    const { precios } = tipo;
    return {
      id: toId(tipo),
      nombre: tipo.nombre,
      descripcion: tipo.descripcion ?? null,
      categoria: tipo.categoria,
      modoPrecio: tipo.modoPrecio,
      precios: precios
        ? {
            ligeiro: precios.ligeiro,
            suv: precios.suv,
            monovolume: precios.monovolume,
            carrinha: precios.carrinha,
          }
        : null,
      precioUnico: tipo.precioUnico ?? null,
      orden: tipo.orden,
      activo: tipo.activo,
      createdAt: tipo.createdAt.toISOString(),
      updatedAt: tipo.updatedAt.toISOString(),
    };
  }
}

export class PrecioResponseDto {
  @ApiProperty({ example: 3000, description: 'Precio de lista en céntimos' })
  precio: number;
}
