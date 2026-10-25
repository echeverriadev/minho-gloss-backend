import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, QueryFilter } from 'mongoose';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { toId } from '../../common/mongo/to-id.js';
import {
  ETIQUETA_TIPO_VEHICULO,
  TIPOS_VEHICULO,
  type TipoVehiculo,
} from '../../common/vehiculos/tipos-vehiculo.js';
import type { CreateTipoServicioDto } from './dto/create-tipo-servicio.dto.js';
import type { QueryTiposServicioDto } from './dto/query-tipos-servicio.dto.js';
import { TipoServicioResponseDto } from './dto/tipo-servicio-response.dto.js';
import type { UpdateTipoServicioDto } from './dto/update-tipo-servicio.dto.js';
import {
  type Precios,
  TipoServicio,
  type TipoServicioLean,
} from './schemas/tipo-servicio.schema.js';

export const MENSAJE_TIPO_NO_ENCONTRADO = 'Servicio no encontrado';

// Primero los servicios y luego los extras ('servicio' > 'extra'), cada grupo por orden y título.
const ORDEN_CATALOGO = { categoria: -1, orden: 1, nombre: 1 } as const;

function normalizarNombre(nombre: string): string {
  return nombre.trim().toLowerCase();
}

/** Datos de precio que se guardan según el modo, con el mensaje de lo que falte. */
function datosDePrecio(
  modoPrecio: TipoServicio['modoPrecio'],
  precios: Partial<Precios> | null | undefined,
  precioUnico: number | null | undefined,
): Pick<TipoServicio, 'precios' | 'precioUnico'> {
  if (modoPrecio === 'unico') {
    if (precioUnico === undefined || precioUnico === null) {
      throw new BadRequestException('Falta el precio único');
    }
    return { precios: null, precioUnico };
  }
  const faltante = TIPOS_VEHICULO.find((tipo) => precios?.[tipo] === undefined);
  if (faltante || !precios) {
    throw new BadRequestException(
      `Falta el precio para ${ETIQUETA_TIPO_VEHICULO[faltante ?? 'ligeiro']}`,
    );
  }
  return {
    precios: {
      ligeiro: precios.ligeiro ?? 0,
      suv: precios.suv ?? 0,
      monovolume: precios.monovolume ?? 0,
      carrinha: precios.carrinha ?? 0,
    },
    precioUnico: null,
  };
}

/** Precio de lista de una entrada del catálogo para un tipo de vehículo (domain-model). */
export function calcularPrecio(
  tipo: Pick<TipoServicio, 'modoPrecio' | 'precios' | 'precioUnico'>,
  tipoVehiculo: TipoVehiculo,
): number {
  if (tipo.modoPrecio === 'unico') {
    return tipo.precioUnico ?? 0;
  }
  return tipo.precios?.[tipoVehiculo] ?? 0;
}

@Injectable()
export class TiposServicioService {
  constructor(
    @InjectModel(TipoServicio.name) private readonly tipoServicioModel: Model<TipoServicio>,
  ) {}

  async findAll(
    query: QueryTiposServicioDto,
    usuario: UsuarioSesion,
  ): Promise<TipoServicioResponseDto[]> {
    const incluirInactivos = query.incluirInactivos === true && usuario.rol === 'admin';
    const filtro: QueryFilter<TipoServicio> = {
      ...(incluirInactivos ? {} : { activo: true }),
      ...(query.categoria ? { categoria: query.categoria } : {}),
    };
    const tipos = await this.tipoServicioModel
      .find(filtro, null, { sort: ORDEN_CATALOGO })
      .lean<TipoServicioLean[]>()
      .exec();
    return tipos.map((tipo) => TipoServicioResponseDto.from(tipo));
  }

  async findOne(id: string): Promise<TipoServicioResponseDto> {
    return TipoServicioResponseDto.from(await this.findLeanOrFail(id));
  }

  async create(dto: CreateTipoServicioDto): Promise<TipoServicioResponseDto> {
    await this.asegurarNombreLibre(dto.nombre);
    const creado = await this.tipoServicioModel.create({
      nombre: dto.nombre,
      nombreNormalizado: normalizarNombre(dto.nombre),
      descripcion: dto.descripcion || null,
      categoria: dto.categoria,
      modoPrecio: dto.modoPrecio,
      orden: dto.orden ?? 0,
      ...datosDePrecio(dto.modoPrecio, dto.precios, dto.precioUnico),
    });
    return TipoServicioResponseDto.from(creado.toObject());
  }

  async update(id: string, dto: UpdateTipoServicioDto): Promise<TipoServicioResponseDto> {
    const actual = await this.findLeanOrFail(id);
    if (dto.nombre !== undefined) {
      await this.asegurarNombreLibre(dto.nombre, toId(actual));
    }
    const modoPrecio = dto.modoPrecio ?? actual.modoPrecio;
    // Los precios enviados reemplazan solo los tipos de vehículo que vienen en el cuerpo.
    const precios: Partial<Precios> = Object.fromEntries(
      TIPOS_VEHICULO.map((tipo) => [tipo, dto.precios?.[tipo] ?? actual.precios?.[tipo]]).filter(
        ([, valor]) => valor !== undefined,
      ),
    );
    const actualizado = await this.tipoServicioModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.nombre !== undefined
              ? { nombre: dto.nombre, nombreNormalizado: normalizarNombre(dto.nombre) }
              : {}),
            ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion || null } : {}),
            ...(dto.categoria !== undefined ? { categoria: dto.categoria } : {}),
            ...(dto.orden !== undefined ? { orden: dto.orden } : {}),
            modoPrecio,
            ...datosDePrecio(modoPrecio, precios, dto.precioUnico ?? actual.precioUnico),
          },
        },
        { returnDocument: 'after' },
      )
      .lean<TipoServicioLean>()
      .exec();
    if (!actualizado) {
      throw new NotFoundException(MENSAJE_TIPO_NO_ENCONTRADO);
    }
    return TipoServicioResponseDto.from(actualizado);
  }

  /** Baja lógica: los servicios prestados y las métricas pasadas no cambian. */
  async remove(id: string): Promise<void> {
    await this.findLeanOrFail(id);
    await this.tipoServicioModel.updateOne({ _id: id }, { $set: { activo: false } }).exec();
  }

  async precio(id: string, tipoVehiculo: TipoVehiculo): Promise<number> {
    return calcularPrecio(await this.findLeanOrFail(id), tipoVehiculo);
  }

  /** Entradas del catálogo (activas o no) por id, para registrar una atención. */
  async findPorIds(ids: readonly string[]): Promise<TipoServicioLean[]> {
    return this.tipoServicioModel
      .find({ _id: { $in: ids } })
      .lean<TipoServicioLean[]>()
      .exec();
  }

  /** Para la carga inicial: indica si el catálogo no tiene ninguna entrada. */
  async estaVacio(): Promise<boolean> {
    return (await this.tipoServicioModel.countDocuments().exec()) === 0;
  }

  private async findLeanOrFail(id: string): Promise<TipoServicioLean> {
    const tipo = await this.tipoServicioModel.findById(id).lean<TipoServicioLean>().exec();
    if (!tipo) {
      throw new NotFoundException(MENSAJE_TIPO_NO_ENCONTRADO);
    }
    return tipo;
  }

  private async asegurarNombreLibre(nombre: string, excluirId?: string): Promise<void> {
    const otro = await this.tipoServicioModel
      .exists({
        nombreNormalizado: normalizarNombre(nombre),
        activo: true,
        ...(excluirId ? { _id: { $ne: excluirId } } : {}),
      })
      .exec();
    if (otro) {
      throw new ConflictException(`Ya existe un servicio llamado ${nombre.trim()}`);
    }
  }
}
