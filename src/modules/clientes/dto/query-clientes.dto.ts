import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto.js';
import { QueryBoolean } from '../../../common/validation/transforms.js';

export class QueryClientesDto extends PaginationQueryDto {}

export class QueryClienteDto {
  @ApiPropertyOptional({
    description: 'Solo admin: permite ver la ficha de un cliente dado de baja',
  })
  @IsOptional()
  @QueryBoolean()
  @IsBoolean({ message: 'incluirInactivos debe ser true o false' })
  incluirInactivos?: boolean;
}
