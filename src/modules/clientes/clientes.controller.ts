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
import { ClientesService } from './clientes.service.js';
import {
  ClienteConflictoDto,
  ClienteResponseDto,
  ClientesPaginadosDto,
} from './dto/cliente-response.dto.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { QueryClienteDto, QueryClientesDto } from './dto/query-clientes.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@ApiTags('clientes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar y buscar clientes por nombre, apellido, cédula o teléfono' })
  @ApiOkResponse({ type: ClientesPaginadosDto })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  findAll(
    @Query() query: QueryClientesDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<ClientesPaginadosDto> {
    return this.clientesService.findAll(query, usuario);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un cliente' })
  @ApiCreatedResponse({ type: ClienteResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ type: ClienteConflictoDto, description: 'Teléfono o cédula repetidos' })
  create(@Body() dto: CreateClienteDto): Promise<ClienteResponseDto> {
    return this.clientesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver la ficha de un cliente' })
  @ApiOkResponse({ type: ClienteResponseDto })
  @ApiBadRequestResponse({ description: 'El id no es válido' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: QueryClienteDto,
    @UsuarioActual() usuario: UsuarioSesion,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.findOne(id, usuario, query.incluirInactivos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar los datos de un cliente' })
  @ApiOkResponse({ type: ClienteResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  @ApiConflictResponse({ type: ClienteConflictoDto, description: 'Teléfono o cédula repetidos' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dar de baja a un cliente (conserva su historial)' })
  @ApiNoContentResponse({ description: 'Cliente dado de baja' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.clientesService.remove(id);
  }

  @Post(':id/anonimizar')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrar los datos personales de un cliente (RGPD, irreversible)' })
  @ApiNoContentResponse({ description: 'Cliente anonimizado' })
  @ApiForbiddenResponse({ description: 'Solo para administradores' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  @ApiConflictResponse({ description: 'El cliente ya fue anonimizado' })
  anonimizar(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.clientesService.anonimizar(id);
  }
}
