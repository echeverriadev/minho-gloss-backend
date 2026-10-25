import { PartialType } from '@nestjs/swagger';
import { CreateTipoServicioDto } from './create-tipo-servicio.dto.js';

export class UpdateTipoServicioDto extends PartialType(CreateTipoServicioDto) {}
