import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../common/validation/transforms.js';

export class AnularAtencionDto {
  @ApiProperty({ example: 'Registrada dos veces', minLength: 3, maxLength: 200 })
  @Trim()
  @IsString({ message: 'El motivo es obligatorio' })
  @Length(3, 200, { message: 'El motivo debe tener entre 3 y 200 caracteres' })
  motivo: string;
}
