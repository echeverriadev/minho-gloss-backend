import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../../common/validation/transforms.js';
import {
  CATEGORIAS_SERVICIO,
  type CategoriaServicio,
  MODOS_PRECIO,
  type ModoPrecio,
} from '../schemas/tipo-servicio.schema.js';

const MENSAJE_PRECIO = 'Los precios deben ser enteros en céntimos, 0 o mayores';

/** Precios en céntimos por tipo de vehículo; la completitud se valida en el servicio. */
export class PreciosDto {
  @ApiPropertyOptional({ example: 1700, description: 'Ligeiro, en céntimos' })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  ligeiro?: number;

  @ApiPropertyOptional({ example: 2000, description: 'SUV, en céntimos' })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  suv?: number;

  @ApiPropertyOptional({ example: 2500, description: 'Monovolume, en céntimos' })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  monovolume?: number;

  @ApiPropertyOptional({ example: 3000, description: 'Carrinha, en céntimos' })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  carrinha?: number;
}

export class CreateTipoServicioDto {
  @ApiProperty({ example: 'EXPRESS GLOSS', minLength: 2, maxLength: 60 })
  @Trim()
  @IsString({ message: 'El título debe ser un texto' })
  @Length(2, 60, { message: 'El título debe tener entre 2 y 60 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Lavagem rápida e eficiente', maxLength: 300 })
  @IsOptional()
  @Trim()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(300, { message: 'La descripción no puede superar los 300 caracteres' })
  descripcion?: string;

  @ApiProperty({ enum: CATEGORIAS_SERVICIO, example: 'servicio' })
  @IsIn(CATEGORIAS_SERVICIO, { message: 'La categoría debe ser servicio o extra' })
  categoria: CategoriaServicio;

  @ApiProperty({ enum: MODOS_PRECIO, example: 'por-vehiculo' })
  @IsIn(MODOS_PRECIO, { message: 'El modo de precio debe ser por-vehiculo o unico' })
  modoPrecio: ModoPrecio;

  @ApiPropertyOptional({
    type: PreciosDto,
    description: 'Obligatorio con modoPrecio por-vehiculo: los cuatro precios en céntimos',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreciosDto)
  precios?: PreciosDto;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Obligatorio con modoPrecio unico, en céntimos',
  })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  precioUnico?: number;

  @ApiPropertyOptional({ example: 1, default: 0, description: 'Posición dentro de su categoría' })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden debe ser 0 o mayor' })
  orden?: number;
}
