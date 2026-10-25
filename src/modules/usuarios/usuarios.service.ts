import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import type { Model } from 'mongoose';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { toId } from '../../common/mongo/to-id.js';
import {
  type Preferencias,
  PREFERENCIAS_POR_DEFECTO,
} from '../../common/preferencias/preferencias.js';
import { type Paginated, parseSort } from '../../common/pagination/pagination-query.dto.js';
import type { AppConfig } from '../../config/configuration.js';
import type { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import type { QueryUsuariosDto } from './dto/query-usuarios.dto.js';
import type { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { UsuarioResponseDto } from './dto/usuario-response.dto.js';
import { Usuario, type UsuarioDocument, type UsuarioLean } from './schemas/usuario.schema.js';

const BCRYPT_COST = 10;
const SORT_PERMITIDOS = ['nombre', 'email', 'rol', 'createdAt'] as const;

export const MENSAJE_EMAIL_REPETIDO = 'Ya existe un usuario con ese correo';
export const MENSAJE_ULTIMO_ADMIN = 'Debe quedar al menos un administrador activo';
export const MENSAJE_AUTO_DESACTIVAR = 'No puedes desactivar tu propia cuenta';

export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

@Injectable()
export class UsuariosService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Spec auth: crea el primer admin desde variables de entorno si la base no tiene usuarios. */
  async onApplicationBootstrap(): Promise<void> {
    const { email, password, nombre } = this.config.get('adminInicial', { infer: true });
    if (!email || !password) {
      return;
    }
    if ((await this.usuarioModel.countDocuments().exec()) > 0) {
      return;
    }
    await this.usuarioModel.create({
      nombre,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      rol: 'admin',
    });
    this.logger.log(`Se creó el administrador inicial ${email.toLowerCase()}`);
  }

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    if (await this.usuarioModel.exists({ email: dto.email }).exec()) {
      throw new ConflictException(MENSAJE_EMAIL_REPETIDO);
    }
    const creado = await this.usuarioModel.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      rol: dto.rol,
    });
    return UsuarioResponseDto.from(creado.toObject());
  }

  async findAll(query: QueryUsuariosDto): Promise<Paginated<UsuarioResponseDto>> {
    const filtro = query.incluirInactivos ? {} : { activo: true };
    const [items, total] = await Promise.all([
      this.usuarioModel
        .find(filtro, null, {
          sort: parseSort(query.sort, SORT_PERMITIDOS, { nombre: 1 }),
          skip: (query.page - 1) * query.limit,
          limit: query.limit,
        })
        .lean<UsuarioLean[]>()
        .exec(),
      this.usuarioModel.countDocuments(filtro).exec(),
    ]);
    return {
      items: items.map((usuario) => UsuarioResponseDto.from(usuario)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string): Promise<UsuarioResponseDto> {
    return UsuarioResponseDto.from(await this.findLeanOrFail(id));
  }

  /** Datos mínimos de la sesión; `null` si el usuario no existe o está inactivo. */
  async findSesion(id: string): Promise<UsuarioSesion | null> {
    const usuario = await this.usuarioModel
      .findOne({ _id: id, activo: true })
      .lean<UsuarioLean>()
      .exec();
    return usuario ? toSesion(usuario) : null;
  }

  /** Para el login: incluye el hash de la contraseña. */
  findByEmailConPassword(email: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  findByIdConPassword(id: string): Promise<UsuarioDocument | null> {
    return this.usuarioModel.findById(id).select('+passwordHash').exec();
  }

  async update(
    id: string,
    dto: UpdateUsuarioDto,
    actual: UsuarioSesion,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.findLeanOrFail(id);
    if (dto.activo === false && id === actual.id) {
      throw new ConflictException(MENSAJE_AUTO_DESACTIVAR);
    }
    await this.asegurarQuedaAdmin(usuario, { rol: dto.rol, activo: dto.activo });
    const actualizado = await this.usuarioModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean<UsuarioLean>()
      .exec();
    if (!actualizado) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return UsuarioResponseDto.from(actualizado);
  }

  async remove(id: string, actual: UsuarioSesion): Promise<void> {
    await this.update(id, { activo: false }, actual);
  }

  async restablecerPassword(id: string, password: string): Promise<void> {
    await this.findLeanOrFail(id);
    await this.setPassword(id, password);
  }

  /** Cambia la contraseña e invalida cualquier enlace de recuperación pendiente. */
  async setPassword(id: string, password: string): Promise<void> {
    await this.usuarioModel
      .updateOne(
        { _id: id },
        {
          $set: { passwordHash: await hashPassword(password) },
          $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
        },
      )
      .exec();
  }

  /** Cambia solo las preferencias del propio usuario y devuelve cómo quedaron. */
  async updatePreferencias(id: string, cambios: Partial<Preferencias>): Promise<Preferencias> {
    const actual = await this.findLeanOrFail(id);
    const { preferencias: guardadas } = toSesion(actual);
    const preferencias: Preferencias = {
      idioma: cambios.idioma ?? guardadas.idioma,
      tema: cambios.tema ?? guardadas.tema,
    };
    await this.usuarioModel.updateOne({ _id: id }, { $set: { preferencias } }).exec();
    return preferencias;
  }

  async guardarTokenRecuperacion(id: string, tokenHash: string, venceEn: Date): Promise<void> {
    await this.usuarioModel
      .updateOne(
        { _id: id },
        { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: venceEn } },
      )
      .exec();
  }

  /** Usuario activo dueño de un token de recuperación vigente, o `null`. */
  findByTokenRecuperacion(tokenHash: string, ahora: Date): Promise<UsuarioLean | null> {
    return this.usuarioModel
      .findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: ahora },
        activo: true,
      })
      .lean<UsuarioLean>()
      .exec();
  }

  private async findLeanOrFail(id: string): Promise<UsuarioLean> {
    const usuario = await this.usuarioModel.findById(id).lean<UsuarioLean>().exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  /** Regla de domain-model: siempre debe existir al menos un admin activo. */
  private async asegurarQuedaAdmin(
    usuario: UsuarioLean,
    cambios: { rol?: Usuario['rol']; activo?: boolean },
  ): Promise<void> {
    const esAdminActivo = usuario.rol === 'admin' && usuario.activo;
    const dejaDeSerlo =
      (cambios.rol !== undefined && cambios.rol !== 'admin') || cambios.activo === false;
    if (!esAdminActivo || !dejaDeSerlo) {
      return;
    }
    const otrosAdmins = await this.usuarioModel
      .countDocuments({ _id: { $ne: toId(usuario) }, rol: 'admin', activo: true })
      .exec();
    if (otrosAdmins === 0) {
      throw new ConflictException(MENSAJE_ULTIMO_ADMIN);
    }
  }
}

export function toSesion(
  usuario: Pick<UsuarioLean, '_id' | 'nombre' | 'email' | 'rol' | 'preferencias'>,
): UsuarioSesion {
  return {
    id: toId(usuario),
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    // Los usuarios creados antes de las preferencias no tienen el campo guardado.
    preferencias: {
      idioma: usuario.preferencias?.idioma ?? PREFERENCIAS_POR_DEFECTO.idioma,
      tema: usuario.preferencias?.tema ?? PREFERENCIAS_POR_DEFECTO.tema,
    },
  };
}
