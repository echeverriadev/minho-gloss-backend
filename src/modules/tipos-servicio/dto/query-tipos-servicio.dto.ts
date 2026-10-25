import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { QueryBoolean } from '../../../common/validation/transforms.js';
import { TIPOS_VEHICULO, type TipoVehiculo } from '../../../common/vehiculos/tipos-vehiculo.js';
import { CATEGORIAS_SERVICIO, type CategoriaServicio } from '../schemas/tipo-servicio.schema.js';

export class QueryTiposServicioDto {
  @ApiPropertyOptional({ enum: CATEGORIAS_SERVICIO })
  @IsOptional()
  @IsIn(CATEGORIAS_SERVICIO, { message: 'La categoría debe ser servicio o extra' })
  categoria?: CategoriaServicio;

  @ApiPropertyOptional({ description: 'Solo admin: incluye los dados de baja' })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean({ message: 'incluirInactivos debe ser true o false' })
  incluirInactivos?: boolean;
}

export class QueryPrecioDto {
  @ApiPropertyOptional({ enum: TIPOS_VEHICULO, example: 'suv' })
  @IsIn(TIPOS_VEHICULO, {
    message: 'El tipo de vehículo debe ser ligeiro, suv, monovolume o carrinha',
  })
  tipoVehiculo: TipoVehiculo;
}
