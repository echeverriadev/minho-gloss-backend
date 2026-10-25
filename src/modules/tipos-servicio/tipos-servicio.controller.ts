import {
  Body,
  Controller,
  Delete,
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
  ApiNoContentResponse,
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
import { CreateTipoServicioDto } from './dto/create-tipo-servicio.dto.js';
import { QueryPrecioDto, QueryTiposServicioDto } from './dto/query-tipos-servicio.dto.js';
import { PrecioResponseDto, TipoServicioResponseDto } from './dto/tipo-servicio-response.dto.js';
import { UpdateTipoServicioDto } from './dto/update-tipo-servicio.dto.js';
import { TiposServicioService } from './tipos-servicio.service.js';

@ApiTags('tipos-servicio')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
@Controller('tipos-servicio')
export class TiposServicioController {
  constructor(private readonly tiposServicioService: TiposServicioService) {}

  @Get()
  @ApiOperation({ summary: 'Ver el catálogo de servicios y extras' })
  @ApiOkResponse({ type: [TipoServicioResponseDto] })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  findAll(
    @Query() query: QueryTiposServicioDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<TipoServicioResponseDto[]> {
    return this.tiposServicioService.findAll(query, usuario);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Agregar un servicio o extra al catálogo' })
  @ApiCreatedResponse({ type: TipoServicioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o precios incompletos' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiConflictResponse({ description: 'Ya existe un servicio con ese título' })
  create(@Body() dto: CreateTipoServicioDto): Promise<TipoServicioResponseDto> {
    return this.tiposServicioService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un servicio del catálogo' })
  @ApiOkResponse({ type: TipoServicioResponseDto })
  @ApiNotFoundResponse({ description: 'Servicio no encontrado' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<TipoServicioResponseDto> {
    return this.tiposServicioService.findOne(id);
  }

  @Get(':id/precio')
  @ApiOperation({ summary: 'Precio de lista para un tipo de vehículo' })
  @ApiOkResponse({ type: PrecioResponseDto })
  @ApiBadRequestResponse({ description: 'Tipo de vehículo inválido' })
  @ApiNotFoundResponse({ description: 'Servicio no encontrado' })
  async precio(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: QueryPrecioDto,
  ): Promise<PrecioResponseDto> {
    return { precio: await this.tiposServicioService.precio(id, query.tipoVehiculo) };
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Editar título, descripción, categoría, precios u orden' })
  @ApiOkResponse({ type: TipoServicioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o precios incompletos' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiNotFoundResponse({ description: 'Servicio no encontrado' })
  @ApiConflictResponse({ description: 'Ya existe un servicio con ese título' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTipoServicioDto,
  ): Promise<TipoServicioResponseDto> {
    return this.tiposServicioService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dar de baja un servicio (el historial no cambia)' })
  @ApiNoContentResponse({ description: 'Servicio dado de baja' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiNotFoundResponse({ description: 'Servicio no encontrado' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.tiposServicioService.remove(id);
  }
}
