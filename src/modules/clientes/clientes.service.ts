import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { type Connection, type QueryFilter, type Model, Types } from 'mongoose';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { toId } from '../../common/mongo/to-id.js';
import {
  escapeRegex,
  normalizarCedula,
  normalizarTextoBusqueda,
} from '../../common/normalizacion/normalizacion.js';
import { type Paginated, parseSort } from '../../common/pagination/pagination-query.dto.js';
import { ClienteResponseDto } from './dto/cliente-response.dto.js';
import type { CreateClienteDto } from './dto/create-cliente.dto.js';
import type { QueryClientesDto } from './dto/query-clientes.dto.js';
import type { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { Cliente, type ClienteLean } from './schemas/cliente.schema.js';

const SORT_PERMITIDOS = ['nombre', 'apellido', 'createdAt', 'ultimoServicioEn'] as const;
const ORDEN_POR_DEFECTO = { apellido: 1, nombre: 1 } as const;
const MIN_DIGITOS_BUSQUEDA_TELEFONO = 3;

export const MENSAJE_CLIENTE_NO_ENCONTRADO = 'Cliente no encontrado';
export const MENSAJE_YA_ANONIMIZADO = 'El cliente ya fue anonimizado';

type CampoUnico = 'telefono' | 'cedula';

export interface ClienteResumen {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  email: string | null;
}

const MENSAJE_DUPLICADO: Record<CampoUnico, string> = {
  telefono: 'El teléfono ya está registrado para',
  cedula: 'La cédula ya está registrada para',
};

function textoBusqueda(nombre: string, apellido: string): string {
  return normalizarTextoBusqueda(`${nombre} ${apellido}`);
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name) private readonly clienteModel: Model<Cliente>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    await this.asegurarUnicos({ telefono: dto.telefono, cedula: dto.cedula });
    const creado = await this.clienteModel.create({
      ...datosCliente(dto),
      busqueda: textoBusqueda(dto.nombre, dto.apellido),
    });
    return ClienteResponseDto.from(creado.toObject());
  }

  async findAll(
    query: QueryClientesDto,
    usuario: UsuarioSesion,
  ): Promise<Paginated<ClienteResponseDto>> {
    const incluirInactivos = query.incluirInactivos === true && usuario.rol === 'admin';
    const filtro: QueryFilter<Cliente> = {
      ...(incluirInactivos ? {} : { activo: true }),
      ...filtroBusqueda(query.q),
    };
    const [items, total] = await Promise.all([
      this.clienteModel
        .find(filtro, null, {
          sort: parseSort(query.sort, SORT_PERMITIDOS, ORDEN_POR_DEFECTO),
          skip: (query.page - 1) * query.limit,
          limit: query.limit,
        })
        .lean<ClienteLean[]>()
        .exec(),
      this.clienteModel.countDocuments(filtro).exec(),
    ]);
    return {
      items: items.map((cliente) => ClienteResponseDto.from(cliente)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(
    id: string,
    usuario: UsuarioSesion,
    incluirInactivos = false,
  ): Promise<ClienteResponseDto> {
    const cliente = await this.clienteModel.findById(id).lean<ClienteLean>().exec();
    const puedeVerInactivos = incluirInactivos && usuario.rol === 'admin';
    if (!cliente || (!cliente.activo && !puedeVerInactivos)) {
      throw new NotFoundException(MENSAJE_CLIENTE_NO_ENCONTRADO);
    }
    return ClienteResponseDto.from(cliente);
  }

  async update(id: string, dto: UpdateClienteDto): Promise<ClienteResponseDto> {
    const actual = await this.findActivoOrFail(id);
    await this.asegurarUnicos({ telefono: dto.telefono, cedula: dto.cedula }, toId(actual));
    const nombre = dto.nombre ?? actual.nombre;
    const apellido = dto.apellido ?? actual.apellido;
    const actualizado = await this.clienteModel
      .findByIdAndUpdate(
        id,
        { $set: { ...datosCliente(dto), busqueda: textoBusqueda(nombre, apellido) } },
        { returnDocument: 'after' },
      )
      .lean<ClienteLean>()
      .exec();
    if (!actualizado) {
      throw new NotFoundException(MENSAJE_CLIENTE_NO_ENCONTRADO);
    }
    return ClienteResponseDto.from(actualizado);
  }

  /** Baja lógica: sus servicios prestados se conservan (domain-model). */
  async remove(id: string): Promise<void> {
    await this.findActivoOrFail(id);
    await this.clienteModel.updateOne({ _id: id }, { $set: { activo: false } }).exec();
  }

  /** Derecho de supresión (RGPD): irreversible, borra todos los datos personales. */
  async anonimizar(id: string): Promise<void> {
    const cliente = await this.clienteModel.findById(id).lean<ClienteLean>().exec();
    if (!cliente) {
      throw new NotFoundException(MENSAJE_CLIENTE_NO_ENCONTRADO);
    }
    if (cliente.anonimizado) {
      throw new ConflictException(MENSAJE_YA_ANONIMIZADO);
    }
    await this.clienteModel
      .updateOne(
        { _id: id },
        {
          $set: {
            nombre: 'Cliente',
            apellido: 'eliminado',
            busqueda: '',
            aceptaContacto: false,
            activo: false,
            anonimizado: true,
          },
          $unset: {
            cedula: 1,
            telefono: 1,
            email: 1,
            direccion: 1,
            fechaNacimiento: 1,
            notas: 1,
          },
        },
      )
      .exec();
    // La placa es el único dato personal que guardan sus atenciones (domain-model, RGPD).
    // Se usa la colección directamente para no crear una dependencia circular con `atenciones`.
    await this.connection
      .collection('atenciones')
      .updateMany({ clienteId: new Types.ObjectId(id) }, { $set: { placa: null } });
  }

  /** Para registrar una atención: el cliente debe existir y estar activo. */
  async asegurarActivo(id: string): Promise<void> {
    await this.findActivoOrFail(id);
  }

  /** Datos de contacto de varios clientes (activos o no), para mostrarlos en sus atenciones. */
  async resumenes(ids: readonly string[]): Promise<Map<string, ClienteResumen>> {
    if (ids.length === 0) {
      return new Map();
    }
    const clientes = await this.clienteModel
      .find({ _id: { $in: ids } }, { nombre: 1, apellido: 1, cedula: 1, telefono: 1, email: 1 })
      .lean<ClienteLean[]>()
      .exec();
    return new Map(
      clientes.map((cliente) => [
        toId(cliente),
        {
          id: toId(cliente),
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          cedula: cliente.cedula ?? null,
          telefono: cliente.telefono ?? null,
          email: cliente.email ?? null,
        },
      ]),
    );
  }

  /** Guarda los contadores que calcula el módulo de atenciones (domain-model). */
  async actualizarContadores(
    id: string,
    contadores: Pick<Cliente, 'ultimoServicioEn' | 'totalServicios'>,
  ): Promise<void> {
    await this.clienteModel.updateOne({ _id: id }, { $set: contadores }).exec();
  }

  private async findActivoOrFail(id: string): Promise<ClienteLean> {
    const cliente = await this.clienteModel
      .findOne({ _id: id, activo: true })
      .lean<ClienteLean>()
      .exec();
    if (!cliente) {
      throw new NotFoundException(MENSAJE_CLIENTE_NO_ENCONTRADO);
    }
    return cliente;
  }

  /** Teléfono y cédula son únicos entre clientes activos (domain-model). */
  private async asegurarUnicos(
    valores: Partial<Record<CampoUnico, string>>,
    excluirId?: string,
  ): Promise<void> {
    const campos = (['cedula', 'telefono'] as const).filter((campo) => valores[campo]);
    const otros = await Promise.all(
      campos.map((campo) =>
        this.clienteModel
          .findOne({
            [campo]: valores[campo],
            activo: true,
            ...(excluirId ? { _id: { $ne: excluirId } } : {}),
          })
          .lean<ClienteLean>()
          .exec(),
      ),
    );
    const indice = otros.findIndex(Boolean);
    const otro = otros[indice];
    if (otro) {
      const campo = campos[indice];
      throw new ConflictException({
        message: `${MENSAJE_DUPLICADO[campo]} ${otro.nombre} ${otro.apellido}`,
        campo,
        clienteId: toId(otro),
      });
    }
  }
}

const CAMPOS_EDITABLES = [
  'nombre',
  'apellido',
  'cedula',
  'telefono',
  'email',
  'direccion',
  'fechaNacimiento',
  'aceptaContacto',
  'notas',
] as const;

/** Copia solo los campos enviados del DTO (los DTOs son instancias de clase). */
function datosCliente(dto: UpdateClienteDto): Partial<Cliente> {
  return Object.fromEntries(
    CAMPOS_EDITABLES.filter((campo) => dto[campo] !== undefined).map((campo) => [
      campo,
      dto[campo],
    ]),
  );
}

/** Spec clientes: nombre o apellido por inicio de palabra, cédula por prefijo, teléfono por dígitos. */
export function filtroBusqueda(q: string | undefined): QueryFilter<Cliente> {
  const texto = q?.trim();
  if (!texto) {
    return {};
  }
  const condiciones: QueryFilter<Cliente>[] = [
    { busqueda: new RegExp(String.raw`(^|\s)${escapeRegex(normalizarTextoBusqueda(texto))}`) },
  ];
  const cedula = normalizarCedula(texto);
  if (/^[A-Z0-9]+$/.test(cedula)) {
    condiciones.push({ cedula: new RegExp(`^${escapeRegex(cedula)}`) });
  }
  const digitos = texto.replace(/\D/g, '');
  if (digitos.length >= MIN_DIGITOS_BUSQUEDA_TELEFONO && /^[\d\s+\-().]+$/.test(texto)) {
    condiciones.push({ telefono: new RegExp(escapeRegex(digitos)) });
  }
  return { $or: condiciones };
}
