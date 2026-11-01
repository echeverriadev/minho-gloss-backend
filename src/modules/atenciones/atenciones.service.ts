import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, type QueryFilter, Types } from 'mongoose';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { diaEnZona, rangoDeDias } from '../../common/fechas/zona-horaria.js';
import { toId } from '../../common/mongo/to-id.js';
import type { Paginated } from '../../common/pagination/pagination-query.dto.js';
import type { TipoVehiculo } from '../../common/vehiculos/tipos-vehiculo.js';
import type { AppConfig } from '../../config/configuration.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { calcularPrecio, TiposServicioService } from '../tipos-servicio/tipos-servicio.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import type { AnularAtencionDto } from './dto/anular-atencion.dto.js';
import {
  type AtencionesPaginadasDto,
  type AtencionResponseDto,
  type Relacionados,
  type ResumenAtencionesDto,
  toAtencionResponse,
} from './dto/atencion-response.dto.js';
import type { CreateAtencionDto, ItemAtencionDto } from './dto/create-atencion.dto.js';
import type { QueryAtencionesDto } from './dto/query-atenciones.dto.js';
import type { UpdateAtencionDto } from './dto/update-atencion.dto.js';
import { Atencion, type AtencionLean, type ItemAtencion } from './schemas/atencion.schema.js';
import { Contador } from './schemas/contador.schema.js';

export const MENSAJE_ATENCION_NO_ENCONTRADA = 'Atención no encontrada';
export const MENSAJE_FECHA_FUTURA = 'La fecha de la atención no puede estar en el futuro';
export const MENSAJE_DIA_ANTERIOR =
  'Solo un administrador puede registrar atenciones de días anteriores';
export const MENSAJE_OTRO_DIA = 'Solo un administrador puede ver atenciones de otros días';
export const MENSAJE_EDITAR_DIA_ANTERIOR =
  'Solo un administrador puede editar atenciones de días anteriores';
export const MENSAJE_PRECIO_ADMIN =
  'Solo un administrador puede cambiar precios o agregar servicios personalizados';
export const MENSAJE_PERSONALIZADO_INCOMPLETO =
  'Los servicios personalizados necesitan nombre y precio';
export const MENSAJE_YA_ANULADA = 'La atención ya está anulada';
export const MENSAJE_ANULADA_NO_EDITABLE = 'La atención está anulada y no se puede editar';
export const MENSAJE_RANGO_INVALIDO = 'La fecha desde no puede ser posterior a hasta';

const CONTADOR_ATENCIONES = 'atenciones';
// Margen para relojes de celulares un poco adelantados respecto del servidor.
const TOLERANCIA_FUTURO_MS = 60_000;
const ORDEN = { realizadoEn: -1, numero: -1 } as const;

@Injectable()
export class AtencionesService {
  constructor(
    @InjectModel(Atencion.name) private readonly atencionModel: Model<Atencion>,
    @InjectModel(Contador.name) private readonly contadorModel: Model<Contador>,
    private readonly clientesService: ClientesService,
    private readonly tiposServicioService: TiposServicioService,
    private readonly usuariosService: UsuariosService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async create(dto: CreateAtencionDto, usuario: UsuarioSesion): Promise<AtencionResponseDto> {
    const ahora = new Date();
    const realizadoEn = dto.realizadoEn ? new Date(dto.realizadoEn) : ahora;
    if (realizadoEn.getTime() > ahora.getTime() + TOLERANCIA_FUTURO_MS) {
      throw new BadRequestException(MENSAJE_FECHA_FUTURA);
    }
    if (usuario.rol !== 'admin' && this.dia(realizadoEn) !== this.dia(ahora)) {
      throw new ForbiddenException(MENSAJE_DIA_ANTERIOR);
    }
    if (dto.clienteId) {
      await this.clientesService.asegurarActivo(dto.clienteId);
    }
    const items = await this.armarItems(dto.items, dto.tipoVehiculo, usuario);

    const creada = await this.atencionModel.create({
      numero: await this.siguienteNumero(),
      clienteId: dto.clienteId ? new Types.ObjectId(dto.clienteId) : null,
      tipoVehiculo: dto.tipoVehiculo,
      placa: dto.placa ?? null,
      items,
      total: items.reduce((suma, item) => suma + item.precio, 0),
      metodoPago: dto.metodoPago,
      realizadoEn,
      registradoPor: new Types.ObjectId(usuario.id),
      notas: dto.notas || null,
    });
    if (dto.clienteId) {
      await this.recalcularContadores(dto.clienteId);
    }
    return this.responder(creada.toObject<AtencionLean>());
  }

  async findAll(
    query: QueryAtencionesDto,
    usuario: UsuarioSesion,
  ): Promise<AtencionesPaginadasDto> {
    const filtro = this.filtro(query, usuario);
    const [items, total, resumen] = await Promise.all([
      this.atencionModel
        .find(filtro, null, {
          sort: ORDEN,
          skip: (query.page - 1) * query.limit,
          limit: query.limit,
        })
        .lean<AtencionLean[]>()
        .exec(),
      this.atencionModel.countDocuments(filtro).exec(),
      this.resumen(filtro),
    ]);
    const relacionados = await this.relacionados(items);
    const pagina: Paginated<AtencionResponseDto> = {
      items: items.map((atencion) => toAtencionResponse(atencion, relacionados)),
      total,
      page: query.page,
      limit: query.limit,
    };
    return { ...pagina, resumen };
  }

  async findOne(id: string): Promise<AtencionResponseDto> {
    return this.responder(await this.findLeanOrFail(id));
  }

  async update(
    id: string,
    dto: UpdateAtencionDto,
    usuario: UsuarioSesion,
  ): Promise<AtencionResponseDto> {
    const actual = await this.findLeanOrFail(id);
    if (actual.estado === 'anulada') {
      throw new ConflictException(MENSAJE_ANULADA_NO_EDITABLE);
    }
    if (usuario.rol !== 'admin' && this.dia(actual.realizadoEn) !== this.dia(new Date())) {
      throw new ForbiddenException(MENSAJE_EDITAR_DIA_ANTERIOR);
    }
    const actualizada = await this.atencionModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.metodoPago !== undefined ? { metodoPago: dto.metodoPago } : {}),
            ...(dto.notas !== undefined ? { notas: dto.notas || null } : {}),
          },
        },
        { returnDocument: 'after' },
      )
      .lean<AtencionLean>()
      .exec();
    if (!actualizada) {
      throw new NotFoundException(MENSAJE_ATENCION_NO_ENCONTRADA);
    }
    return this.responder(actualizada);
  }

  /** La atención se conserva, pero deja de contar en el resumen, las métricas y el cliente. */
  async anular(
    id: string,
    dto: AnularAtencionDto,
    usuario: UsuarioSesion,
  ): Promise<AtencionResponseDto> {
    const actual = await this.findLeanOrFail(id);
    if (actual.estado === 'anulada') {
      throw new ConflictException(MENSAJE_YA_ANULADA);
    }
    const anulada = await this.atencionModel
      .findOneAndUpdate(
        { _id: id, estado: 'completada' },
        {
          $set: {
            estado: 'anulada',
            anulacion: {
              motivo: dto.motivo,
              anuladoPor: new Types.ObjectId(usuario.id),
              anuladoEn: new Date(),
            },
          },
        },
        { returnDocument: 'after' },
      )
      .lean<AtencionLean>()
      .exec();
    if (!anulada) {
      throw new ConflictException(MENSAJE_YA_ANULADA);
    }
    if (anulada.clienteId) {
      await this.recalcularContadores(anulada.clienteId.toString());
    }
    return this.responder(anulada);
  }

  /** Copia nombre, categoría y precio de lista del catálogo; los precios distintos son del admin. */
  private async armarItems(
    items: readonly ItemAtencionDto[],
    tipoVehiculo: TipoVehiculo,
    usuario: UsuarioSesion,
  ): Promise<ItemAtencion[]> {
    const ids = [...new Set(items.flatMap((item) => item.tipoServicioId ?? []))];
    const tipos = new Map(
      (await this.tiposServicioService.findPorIds(ids)).map((tipo) => [toId(tipo), tipo]),
    );
    const esAdmin = usuario.rol === 'admin';

    return items.map((item) => {
      if (!item.tipoServicioId) {
        if (!esAdmin) {
          throw new ForbiddenException(MENSAJE_PRECIO_ADMIN);
        }
        if (!item.nombre || item.precio === undefined) {
          throw new BadRequestException(MENSAJE_PERSONALIZADO_INCOMPLETO);
        }
        return {
          tipoServicioId: null,
          nombre: item.nombre,
          categoria: 'personalizado',
          precioLista: null,
          precio: item.precio,
        };
      }
      const tipo = tipos.get(item.tipoServicioId);
      if (!tipo) {
        throw new NotFoundException('Servicio no encontrado');
      }
      if (!tipo.activo) {
        throw new ConflictException(`El servicio ${tipo.nombre} ya no está disponible`);
      }
      const precioLista = calcularPrecio(tipo, tipoVehiculo);
      const precio = item.precio ?? precioLista;
      if (precio !== precioLista && !esAdmin) {
        throw new ForbiddenException(MENSAJE_PRECIO_ADMIN);
      }
      return {
        tipoServicioId: new Types.ObjectId(item.tipoServicioId),
        nombre: tipo.nombre,
        categoria: tipo.categoria,
        precioLista,
        precio,
      };
    });
  }

  private filtro(query: QueryAtencionesDto, usuario: UsuarioSesion): QueryFilter<Atencion> {
    const hoy = this.dia(new Date());
    let { desde, hasta } = query;
    if (usuario.rol !== 'admin' && !query.clienteId) {
      // El empleado trabaja con el día actual; el historial de un cliente lo ve completo.
      if ((desde && desde !== hoy) || (hasta && hasta !== hoy)) {
        throw new ForbiddenException(MENSAJE_OTRO_DIA);
      }
      desde = hoy;
      hasta = hoy;
    }
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException(MENSAJE_RANGO_INVALIDO);
    }
    const zona = this.config.get('timeZone', { infer: true });
    const realizadoEn =
      desde || hasta
        ? {
            ...(desde ? { $gte: rangoDeDias(desde, desde, zona).$gte } : {}),
            ...(hasta ? { $lt: rangoDeDias(hasta, hasta, zona).$lt } : {}),
          }
        : undefined;
    return {
      estado: query.estado ?? 'completada',
      ...(realizadoEn ? { realizadoEn } : {}),
      ...(query.clienteId ? { clienteId: new Types.ObjectId(query.clienteId) } : {}),
      ...(query.metodoPago ? { metodoPago: query.metodoPago } : {}),
    };
  }

  private async resumen(filtro: QueryFilter<Atencion>): Promise<ResumenAtencionesDto> {
    const [resultado] = await this.atencionModel
      .aggregate<ResumenAtencionesDto>([
        { $match: filtro },
        { $group: { _id: null, cantidad: { $sum: 1 }, total: { $sum: '$total' } } },
        { $project: { _id: 0, cantidad: 1, total: 1 } },
      ])
      .exec();
    return resultado ?? { cantidad: 0, total: 0 };
  }

  /** Recalcula (no incrementa) los contadores para que anular siempre deje valores correctos. */
  private async recalcularContadores(clienteId: string): Promise<void> {
    const filtro = { clienteId: new Types.ObjectId(clienteId), estado: 'completada' as const };
    const [ultima, totalServicios] = await Promise.all([
      this.atencionModel
        .findOne(filtro, { realizadoEn: 1 }, { sort: { realizadoEn: -1 } })
        .lean<Pick<AtencionLean, 'realizadoEn'>>()
        .exec(),
      this.atencionModel.countDocuments(filtro).exec(),
    ]);
    await this.clientesService.actualizarContadores(clienteId, {
      ultimoServicioEn: ultima?.realizadoEn ?? null,
      totalServicios,
    });
  }

  private async siguienteNumero(): Promise<number> {
    const contador = await this.contadorModel
      .findOneAndUpdate(
        { _id: CONTADOR_ATENCIONES },
        { $inc: { valor: 1 } },
        { upsert: true, returnDocument: 'after' },
      )
      .lean<Contador>()
      .exec();
    return contador?.valor ?? 1;
  }

  private async relacionados(atenciones: readonly AtencionLean[]): Promise<Relacionados> {
    const clienteIds = new Set<string>();
    const usuarioIds = new Set<string>();
    for (const atencion of atenciones) {
      if (atencion.clienteId) {
        clienteIds.add(atencion.clienteId.toString());
      }
      usuarioIds.add(atencion.registradoPor.toString());
      if (atencion.anulacion) {
        usuarioIds.add(atencion.anulacion.anuladoPor.toString());
      }
    }
    const [clientes, usuarios] = await Promise.all([
      this.clientesService.resumenes([...clienteIds]),
      this.usuariosService.nombres([...usuarioIds]),
    ]);
    return { clientes, usuarios };
  }

  private async responder(atencion: AtencionLean): Promise<AtencionResponseDto> {
    return toAtencionResponse(atencion, await this.relacionados([atencion]));
  }

  private async findLeanOrFail(id: string): Promise<AtencionLean> {
    const atencion = await this.atencionModel.findById(id).lean<AtencionLean>().exec();
    if (!atencion) {
      throw new NotFoundException(MENSAJE_ATENCION_NO_ENCONTRADA);
    }
    return atencion;
  }

  private dia(fecha: Date): string {
    return diaEnZona(fecha, this.config.get('timeZone', { infer: true }));
  }
}
