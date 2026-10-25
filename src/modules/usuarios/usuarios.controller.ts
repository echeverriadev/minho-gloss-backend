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
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { RestablecerPasswordUsuarioDto } from './dto/password.dto.js';
import { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { UsuarioResponseDto, UsuariosPaginadosDto } from './dto/usuario-response.dto.js';
import { UsuariosService } from './usuarios.service.js';

@ApiTags('usuarios')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
@ApiForbiddenResponse({ description: 'Solo para administradores' })
@Roles('admin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios del negocio' })
  @ApiOkResponse({ type: UsuariosPaginadosDto })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  findAll(@Query() query: QueryUsuariosDto): Promise<UsuariosPaginadosDto> {
    return this.usuariosService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario (solo el admin puede dar de alta cuentas)' })
  @ApiCreatedResponse({ type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'Ya existe un usuario con ese correo' })
  create(@Body() dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.usuariosService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'El id no es válido' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<UsuarioResponseDto> {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar nombre, rol o estado de un usuario' })
  @ApiOkResponse({ type: UsuarioResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiConflictResponse({ description: 'Dejaría al negocio sin administrador activo' })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @UsuarioActual() actual: UsuarioSesion,
  ): Promise<UsuarioResponseDto> {
    return this.usuariosService.update(id, dto, actual);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un usuario (baja lógica)' })
  @ApiNoContentResponse({ description: 'Usuario desactivado' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiConflictResponse({ description: 'Dejaría al negocio sin administrador activo' })
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @UsuarioActual() actual: UsuarioSesion,
  ): Promise<void> {
    return this.usuariosService.remove(id, actual);
  }

  @Post(':id/restablecer-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asignar una contraseña nueva a un usuario' })
  @ApiNoContentResponse({ description: 'Contraseña reemplazada' })
  @ApiBadRequestResponse({ description: 'Contraseña inválida' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  restablecerPassword(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RestablecerPasswordUsuarioDto,
  ): Promise<void> {
    return this.usuariosService.restablecerPassword(id, dto.password);
  }
}
