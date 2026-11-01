import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../../common/validation/transforms.js';
import { TIPOS_VEHICULO, type TipoVehiculo } from '../../../common/vehiculos/tipos-vehiculo.js';
import { METODOS_PAGO, type MetodoPago } from '../schemas/atencion.schema.js';

export const MAX_ITEMS_ATENCION = 20;
const MENSAJE_PRECIO = 'El precio debe ser un entero en céntimos, 0 o mayor';

/** Placa en mayúsculas sin espacios, puntos ni guiones (`aa-12-bb` → `AA12BB`); vacía → sin placa. */
export function normalizarPlaca(texto: string): string {
  return texto.toUpperCase().replace(/[\s.\-/]/g, '');
}

export class ItemAtencionDto {
  @ApiPropertyOptional({
    example: '652f1c2b9d1e8a0012345678',
    description: 'Servicio o extra del catálogo; sin él, es un servicio personalizado (solo admin)',
  })
  @IsOptional()
  @IsMongoId({ message: 'El servicio no es válido' })
  tipoServicioId?: string;

  @ApiPropertyOptional({
    example: 'Limpieza de llantas',
    description: 'Solo en los servicios personalizados',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: 'El nombre del servicio debe ser un texto' })
  @Length(2, 60, { message: 'El nombre del servicio debe tener entre 2 y 60 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    example: 2000,
    description:
      'Precio cobrado en céntimos; por defecto el de lista. Distinto del de lista: solo admin',
  })
  @IsOptional()
  @IsInt({ message: MENSAJE_PRECIO })
  @Min(0, { message: MENSAJE_PRECIO })
  precio?: number;
}

export class CreateAtencionDto {
  @ApiPropertyOptional({
    example: '652f1c2b9d1e8a0012345678',
    description: 'Cliente activo; se omite si el cliente no quiere registrarse',
  })
  @IsOptional()
  @IsMongoId({ message: 'El cliente no es válido' })
  clienteId?: string;

  @ApiProperty({ enum: TIPOS_VEHICULO, example: 'suv' })
  @IsIn(TIPOS_VEHICULO, {
    message: 'El tipo de vehículo debe ser ligeiro, suv, monovolume o carrinha',
  })
  tipoVehiculo: TipoVehiculo;

  @ApiPropertyOptional({ example: 'AA-12-BB', description: 'Se guarda como AA12BB' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizarPlaca(value) || undefined : value,
  )
  @IsString({ message: 'La placa debe ser un texto' })
  @Matches(/^[A-Z0-9]{2,12}$/, { message: 'La placa debe tener entre 2 y 12 letras o números' })
  placa?: string;

  @ApiProperty({ type: [ItemAtencionDto], minItems: 1, maxItems: MAX_ITEMS_ATENCION })
  @IsArray({ message: 'Agrega al menos un servicio' })
  @ArrayMinSize(1, { message: 'Agrega al menos un servicio' })
  @ArrayMaxSize(MAX_ITEMS_ATENCION, {
    message: `Una atención puede tener hasta ${MAX_ITEMS_ATENCION} servicios`,
  })
  @ValidateNested({ each: true })
  @Type(() => ItemAtencionDto)
  items: ItemAtencionDto[];

  @ApiProperty({ enum: METODOS_PAGO, example: 'efectivo' })
  @IsIn(METODOS_PAGO, {
    message: 'El método de pago debe ser efectivo, tarjeta, mbway, transferencia u otro',
  })
  metodoPago: MetodoPago;

  @ApiPropertyOptional({
    example: '2026-10-25T10:30:00.000Z',
    description: 'Por defecto, ahora. Días anteriores: solo admin',
  })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'La fecha de la atención no es válida' })
  realizadoEn?: string;

  @ApiPropertyOptional({ example: 'Cliente pidió revisar las alfombras', maxLength: 300 })
  @IsOptional()
  @Trim()
  @IsString({ message: 'Las notas deben ser un texto' })
  @MaxLength(300, { message: 'Las notas no pueden superar los 300 caracteres' })
  notas?: string;
}
