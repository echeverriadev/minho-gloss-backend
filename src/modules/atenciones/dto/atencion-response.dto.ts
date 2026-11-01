import { ApiProperty } from '@nestjs/swagger';
import { toId } from '../../../common/mongo/to-id.js';
import { TIPOS_VEHICULO, type TipoVehiculo } from '../../../common/vehiculos/tipos-vehiculo.js';
import {
  type AtencionLean,
  CATEGORIAS_ITEM,
  type CategoriaItem,
  ESTADOS_ATENCION,
  type EstadoAtencion,
  type ItemAtencion,
  METODOS_PAGO,
  type MetodoPago,
} from '../schemas/atencion.schema.js';

export class ClienteAtencionDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'Ana' })
  nombre: string;

  @ApiProperty({ example: 'Silva' })
  apellido: string;

  @ApiProperty({ example: '123456789', nullable: true, type: String })
  cedula: string | null;

  @ApiProperty({ example: '+351912345678', nullable: true, type: String })
  telefono: string | null;

  @ApiProperty({ example: 'ana.silva@example.com', nullable: true, type: String })
  email: string | null;
}

export class UsuarioAtencionDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 'Rui', description: 'Vacío si el usuario ya no existe' })
  nombre: string;
}

export class ItemAtencionResponseDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678', nullable: true, type: String })
  tipoServicioId: string | null;

  @ApiProperty({ example: 'FULL GLOSS' })
  nombre: string;

  @ApiProperty({ enum: CATEGORIAS_ITEM, example: 'servicio' })
  categoria: CategoriaItem;

  @ApiProperty({ example: 2500, nullable: true, type: Number })
  precioLista: number | null;

  @ApiProperty({ example: 2000, description: 'Precio cobrado en céntimos' })
  precio: number;
}

export class AnulacionResponseDto {
  @ApiProperty({ example: 'Registrada dos veces' })
  motivo: string;

  @ApiProperty({ type: UsuarioAtencionDto })
  anuladoPor: UsuarioAtencionDto;

  @ApiProperty({ example: '2026-10-25T18:00:00.000Z' })
  anuladoEn: string;
}

export class AtencionResponseDto {
  @ApiProperty({ example: '652f1c2b9d1e8a0012345678' })
  id: string;

  @ApiProperty({ example: 128 })
  numero: number;

  @ApiProperty({ type: ClienteAtencionDto, nullable: true })
  cliente: ClienteAtencionDto | null;

  @ApiProperty({ enum: TIPOS_VEHICULO, example: 'suv' })
  tipoVehiculo: TipoVehiculo;

  @ApiProperty({ example: 'AA12BB', nullable: true, type: String })
  placa: string | null;

  @ApiProperty({ type: [ItemAtencionResponseDto] })
  items: ItemAtencionResponseDto[];

  @ApiProperty({ example: 6000, description: 'Suma de los precios cobrados, en céntimos' })
  total: number;

  @ApiProperty({ enum: METODOS_PAGO, example: 'efectivo' })
  metodoPago: MetodoPago;

  @ApiProperty({ example: '2026-10-25T10:30:00.000Z' })
  realizadoEn: string;

  @ApiProperty({ type: UsuarioAtencionDto })
  registradoPor: UsuarioAtencionDto;

  @ApiProperty({ example: null, nullable: true, type: String })
  notas: string | null;

  @ApiProperty({ enum: ESTADOS_ATENCION, example: 'completada' })
  estado: EstadoAtencion;

  @ApiProperty({ type: AnulacionResponseDto, nullable: true })
  anulacion: AnulacionResponseDto | null;

  @ApiProperty({ example: '2026-10-25T10:30:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-25T10:30:00.000Z' })
  updatedAt: string;
}

export class ResumenAtencionesDto {
  @ApiProperty({ example: 14, description: 'Atenciones de todo el filtro, no solo de la página' })
  cantidad: number;

  @ApiProperty({ example: 41500, description: 'Total cobrado del filtro, en céntimos' })
  total: number;
}

export class AtencionesPaginadasDto {
  @ApiProperty({ type: [AtencionResponseDto] })
  items: AtencionResponseDto[];

  @ApiProperty({ example: 14 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ type: ResumenAtencionesDto })
  resumen: ResumenAtencionesDto;
}

/** Datos relacionados que se buscan aparte, porque la atención solo guarda sus ids. */
export interface Relacionados {
  clientes: Map<string, ClienteAtencionDto>;
  usuarios: Map<string, string>;
}

function usuario(id: { toString(): string }, relacionados: Relacionados): UsuarioAtencionDto {
  const clave = id.toString();
  return { id: clave, nombre: relacionados.usuarios.get(clave) ?? '' };
}

function item(datos: ItemAtencion): ItemAtencionResponseDto {
  return {
    tipoServicioId: datos.tipoServicioId?.toString() ?? null,
    nombre: datos.nombre,
    categoria: datos.categoria,
    precioLista: datos.precioLista ?? null,
    precio: datos.precio,
  };
}

export function toAtencionResponse(
  atencion: AtencionLean,
  relacionados: Relacionados,
): AtencionResponseDto {
  const { anulacion } = atencion;
  return {
    id: toId(atencion),
    numero: atencion.numero,
    cliente: atencion.clienteId
      ? (relacionados.clientes.get(atencion.clienteId.toString()) ?? null)
      : null,
    tipoVehiculo: atencion.tipoVehiculo,
    placa: atencion.placa ?? null,
    items: atencion.items.map(item),
    total: atencion.total,
    metodoPago: atencion.metodoPago,
    realizadoEn: atencion.realizadoEn.toISOString(),
    registradoPor: usuario(atencion.registradoPor, relacionados),
    notas: atencion.notas ?? null,
    estado: atencion.estado,
    anulacion: anulacion
      ? {
          motivo: anulacion.motivo,
          anuladoPor: usuario(anulacion.anuladoPor, relacionados),
          anuladoEn: anulacion.anuladoEn.toISOString(),
        }
      : null,
    createdAt: atencion.createdAt.toISOString(),
    updatedAt: atencion.updatedAt.toISOString(),
  };
}
