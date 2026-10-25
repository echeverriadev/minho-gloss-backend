import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { QueryBoolean, Trim } from '../validation/transforms.js';

export const LIMITE_MAXIMO = 100;

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser 1 o mayor' })
  page = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: LIMITE_MAXIMO })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser 1 o mayor' })
  @Max(LIMITE_MAXIMO, { message: `limit no puede ser mayor que ${LIMITE_MAXIMO}` })
  limit = 20;

  @ApiPropertyOptional({ description: 'Texto a buscar', example: 'jose' })
  @IsOptional()
  @Trim()
  @IsString({ message: 'q debe ser un texto' })
  @MaxLength(100, { message: 'q no puede superar los 100 caracteres' })
  q?: string;

  @ApiPropertyOptional({
    description: 'Campo de orden; con `-` delante es descendente',
    example: '-createdAt',
  })
  @IsOptional()
  @IsString({ message: 'sort debe ser un texto' })
  sort?: string;

  @ApiPropertyOptional({ description: 'Solo admin: incluye registros dados de baja' })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean({ message: 'incluirInactivos debe ser true o false' })
  incluirInactivos?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Traduce `sort=-createdAt` al formato de Mongoose, aceptando solo los campos permitidos. */
export function parseSort(
  sort: string | undefined,
  permitidos: readonly string[],
  porDefecto: Record<string, 1 | -1>,
): Record<string, 1 | -1> {
  if (!sort) {
    return porDefecto;
  }
  const campo = sort.replace(/^-/, '');
  if (!permitidos.includes(campo)) {
    return porDefecto;
  }
  return { [campo]: sort.startsWith('-') ? -1 : 1 };
}
