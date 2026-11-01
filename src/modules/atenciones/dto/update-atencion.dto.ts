import { PickType } from '@nestjs/swagger';
import { CreateAtencionDto } from './create-atencion.dto.js';

/** Solo se corrigen el método de pago y las notas; lo demás se anula y se registra de nuevo. */
export class UpdateAtencionDto extends PickType(CreateAtencionDto, ['metodoPago', 'notas']) {}
