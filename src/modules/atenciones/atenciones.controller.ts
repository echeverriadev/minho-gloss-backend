import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator.js';
import { UsuarioActual } from '../../common/auth/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe.js';
import { AtencionesService } from './atenciones.service.js';
import { AnularAtencionDto } from './dto/anular-atencion.dto.js';
import { AtencionesPaginadasDto, AtencionResponseDto } from './dto/atencion-response.dto.js';
import { CreateAtencionDto } from './dto/create-atencion.dto.js';
import { QueryAtencionesDto } from './dto/query-atenciones.dto.js';
import { UpdateAtencionDto } from './dto/update-atencion.dto.js';

@ApiTags('atenciones')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
@Controller('atenciones')
export class AtencionesController {
  constructor(private readonly atencionesService: AtencionesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una atención con uno o más servicios prestados',
    description:
      'Copia nombre y precio de lista del catálogo según el tipo de vehículo. Solo un admin puede cobrar otro precio, agregar servicios personalizados (sin `tipoServicioId`) o registrar días anteriores.',
  })
  @ApiCreatedResponse({ type: AtencionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o fecha en el futuro' })
  @ApiForbiddenResponse({ description: 'Precio personalizado o día anterior sin ser admin' })
  @ApiNotFoundResponse({ description: 'Cliente o servicio no encontrado' })
  @ApiConflictResponse({ description: 'Un servicio del catálogo está dado de baja' })
  create(
    @Body() dto: CreateAtencionDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<AtencionResponseDto> {
    return this.atencionesService.create(dto, usuario);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar atenciones con el resumen del filtro',
    description:
      'Por defecto solo las completadas. Un empleado ve solo el día actual, salvo el historial de un cliente (`clienteId`).',
  })
  @ApiOkResponse({ type: AtencionesPaginadasDto })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  @ApiForbiddenResponse({ description: 'Un empleado pidió otro día' })
  findAll(
    @Query() query: QueryAtencionesDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<AtencionesPaginadasDto> {
    return this.atencionesService.findAll(query, usuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una atención, con los datos del cliente' })
  @ApiOkResponse({ type: AtencionResponseDto })
  @ApiNotFoundResponse({ description: 'Atención no encontrada' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<AtencionResponseDto> {
    return this.atencionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Corregir el método de pago o las notas' })
  @ApiOkResponse({ type: AtencionResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiForbiddenResponse({ description: 'Un empleado intentó editar un día anterior' })
  @ApiNotFoundResponse({ description: 'Atención no encontrada' })
  @ApiConflictResponse({ description: 'La atención está anulada' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateAtencionDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<AtencionResponseDto> {
    return this.atencionesService.update(id, dto, usuario);
  }

  @Post(':id/anular')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anular una atención con un motivo (no se borra)' })
  @ApiOkResponse({ type: AtencionResponseDto })
  @ApiBadRequestResponse({ description: 'Falta el motivo' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiNotFoundResponse({ description: 'Atención no encontrada' })
  @ApiConflictResponse({ description: 'La atención ya está anulada' })
  anular(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: AnularAtencionDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<AtencionResponseDto> {
    return this.atencionesService.anular(id, dto, usuario);
  }
}
