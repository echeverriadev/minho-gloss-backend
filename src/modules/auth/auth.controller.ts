import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../common/auth/public.decorator.js';
import { UsuarioActual } from '../../common/auth/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { AuthService } from './auth.service.js';
import { CambiarPasswordDto } from './dto/cambiar-password.dto.js';
import { LoginDto, LoginResponseDto } from './dto/login.dto.js';
import { PreferenciasDto, UpdatePreferenciasDto } from './dto/preferencias.dto.js';
import { RecuperarPasswordDto, RestablecerPasswordDto } from './dto/recuperar-password.dto.js';
import { UsuarioSesionDto } from './dto/usuario-sesion.dto.js';

const UN_MINUTO = 60_000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: UN_MINUTO } })
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' })
  @ApiTooManyRequestsResponse({ description: 'Más de 5 intentos por minuto' })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver el usuario de la sesión' })
  @ApiOkResponse({ type: UsuarioSesionDto })
  @ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
  me(@UsuarioActual() usuario: UsuarioSesion): UsuarioSesionDto {
    return usuario;
  }

  @Patch('preferencias')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar el idioma y el tema propios' })
  @ApiOkResponse({ type: PreferenciasDto })
  @ApiBadRequestResponse({ description: 'Idioma o tema inválidos' })
  @ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
  updatePreferencias(
    @UsuarioActual() usuario: UsuarioSesion,
    @Body() dto: UpdatePreferenciasDto,
  ): Promise<PreferenciasDto> {
    return this.usuariosService.updatePreferencias(usuario.id, dto);
  }

  @Post('cambiar-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar la propia contraseña' })
  @ApiNoContentResponse({ description: 'Contraseña cambiada' })
  @ApiBadRequestResponse({ description: 'Contraseña actual incorrecta o nueva inválida' })
  @ApiUnauthorizedResponse({ description: 'Sin sesión o sesión vencida' })
  cambiarPassword(
    @UsuarioActual() usuario: UsuarioSesion,
    @Body() dto: CambiarPasswordDto,
  ): Promise<void> {
    return this.authService.cambiarPassword(usuario, dto);
  }

  @Public()
  @Post('recuperar-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: UN_MINUTO } })
  @ApiOperation({ summary: 'Pedir un enlace por correo para elegir una contraseña nueva' })
  @ApiNoContentResponse({ description: 'Si el correo existe, se envió el enlace' })
  @ApiBadRequestResponse({ description: 'Correo inválido' })
  @ApiTooManyRequestsResponse({ description: 'Más de 3 pedidos por minuto' })
  recuperarPassword(@Body() dto: RecuperarPasswordDto): Promise<void> {
    return this.authService.solicitarRecuperacion(dto.email);
  }

  @Public()
  @Post('restablecer-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: UN_MINUTO } })
  @ApiOperation({ summary: 'Elegir una contraseña nueva con el enlace del correo' })
  @ApiNoContentResponse({ description: 'Contraseña cambiada' })
  @ApiBadRequestResponse({ description: 'Enlace inválido o vencido, o contraseña inválida' })
  @ApiTooManyRequestsResponse({ description: 'Demasiados intentos' })
  restablecerPassword(@Body() dto: RestablecerPasswordDto): Promise<void> {
    return this.authService.restablecerPassword(dto);
  }
}
