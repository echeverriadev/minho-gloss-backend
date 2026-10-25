import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsOptional, Matches } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto.js';
import {
  ESTADOS_ATENCION,
  type EstadoAtencion,
  METODOS_PAGO,
  type MetodoPago,
} from '../schemas/atencion.schema.js';

const DIA = /^\d{4}-\d{2}-\d{2}$/;

export class QueryAtencionesDto extends PickType(PaginationQueryDto, ['page', 'limit']) {
  @ApiPropertyOptional({ example: '2026-10-25', description: 'Primer día, en la zona del negocio' })
  @IsOptional()
  @Matches(DIA, { message: 'desde debe ser una fecha AAAA-MM-DD' })
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-25', description: 'Último día, inclusive' })
  @IsOptional()
  @Matches(DIA, { message: 'hasta debe ser una fecha AAAA-MM-DD' })
  hasta?: string;

  @ApiPropertyOptional({ example: '652f1c2b9d1e8a0012345678' })
  @IsOptional()
  @IsMongoId({ message: 'El cliente no es válido' })
  clienteId?: string;

  @ApiPropertyOptional({ enum: METODOS_PAGO })
  @IsOptional()
  @IsIn(METODOS_PAGO, {
    message: 'El método de pago debe ser efectivo, tarjeta, mbway, transferencia u otro',
  })
  metodoPago?: MetodoPago;

  @ApiPropertyOptional({ enum: ESTADOS_ATENCION, default: 'completada' })
  @IsOptional()
  @IsIn(ESTADOS_ATENCION, { message: 'El estado debe ser completada o anulada' })
  estado?: EstadoAtencion;
}
