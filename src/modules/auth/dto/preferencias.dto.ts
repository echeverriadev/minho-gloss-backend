import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  IDIOMAS,
  type Idioma,
  TEMAS,
  type Tema,
} from '../../../common/preferencias/preferencias.js';

export class PreferenciasDto {
  @ApiProperty({ enum: IDIOMAS, example: 'pt-PT' })
  idioma: Idioma;

  @ApiProperty({ enum: TEMAS, example: 'oscuro' })
  tema: Tema;
}

export class UpdatePreferenciasDto {
  @ApiPropertyOptional({ enum: IDIOMAS, example: 'pt-PT' })
  @IsOptional()
  @IsIn(IDIOMAS, { message: 'El idioma debe ser es o pt-PT' })
  idioma?: Idioma;

  @ApiPropertyOptional({ enum: TEMAS, example: 'oscuro' })
  @IsOptional()
  @IsIn(TEMAS, { message: 'El tema debe ser claro u oscuro' })
  tema?: Tema;
}
