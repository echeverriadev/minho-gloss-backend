import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import { nuevoId, query } from '../../../test/utils/mock-query.js';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import type { AppConfig } from '../../config/configuration.js';
import type { ClientesService } from '../clientes/clientes.service.js';
import type { TipoServicioLean } from '../tipos-servicio/schemas/tipo-servicio.schema.js';
import type { TiposServicioService } from '../tipos-servicio/tipos-servicio.service.js';
import type { UsuariosService } from '../usuarios/usuarios.service.js';
import {
  AtencionesService,
  MENSAJE_DIA_ANTERIOR,
  MENSAJE_FECHA_FUTURA,
  MENSAJE_OTRO_DIA,
  MENSAJE_PRECIO_ADMIN,
  MENSAJE_YA_ANULADA,
} from './atenciones.service.js';
import type { CreateAtencionDto } from './dto/create-atencion.dto.js';
import type { Atencion, AtencionLean } from './schemas/atencion.schema.js';
import type { Contador } from './schemas/contador.schema.js';

const ADMIN: UsuarioSesion = {
  id: nuevoId().toString(),
  nombre: 'Admin',
  email: 'admin@minhogloss.pt',
  rol: 'admin',
  preferencias: { idioma: 'es', tema: 'claro' },
};
const EMPLEADO: UsuarioSesion = { ...ADMIN, id: nuevoId().toString(), rol: 'empleado' };

function crearTipo(datos: Partial<TipoServicioLean> = {}): TipoServicioLean {
  const ahora = new Date();
  return {
    _id: nuevoId(),
    nombre: 'FULL GLOSS',
    nombreNormalizado: 'full gloss',
    descripcion: null,
    categoria: 'servicio',
    modoPrecio: 'por-vehiculo',
    precios: { ligeiro: 2500, suv: 3000, monovolume: 3500, carrinha: 4000 },
    precioUnico: null,
    orden: 0,
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
    ...datos,
  };
}

const FULL_GLOSS = crearTipo();
const OZONO = crearTipo({
  nombre: 'Higienização com ozono',
  categoria: 'extra',
  modoPrecio: 'unico',
  precios: null,
  precioUnico: 1500,
});

function crearAtencion(datos: Partial<AtencionLean> = {}): AtencionLean {
  const ahora = new Date();
  return {
    _id: nuevoId(),
    numero: 1,
    clienteId: null,
    tipoVehiculo: 'suv',
    placa: null,
    items: [],
    total: 0,
    metodoPago: 'efectivo',
    realizadoEn: ahora,
    registradoPor: nuevoId(),
    notas: null,
    estado: 'completada',
    anulacion: null,
    createdAt: ahora,
    updatedAt: ahora,
    ...datos,
  };
}

function crearDependencias() {
  const atencionModel = {
    create: vi.fn((datos: Partial<AtencionLean>) =>
      Promise.resolve({ toObject: () => crearAtencion(datos) }),
    ),
    find: vi.fn(() => query<AtencionLean[]>([])),
    findById: vi.fn(),
    findOne: vi.fn(() => query<Pick<AtencionLean, 'realizadoEn'> | null>(null)),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    countDocuments: vi.fn(() => query(0)),
    aggregate: vi.fn(() => ({ exec: () => Promise.resolve([]) })),
  };
  const contadorModel = { findOneAndUpdate: vi.fn(() => query({ _id: 'atenciones', valor: 7 })) };
  const clientes = {
    asegurarActivo: vi.fn(() => Promise.resolve()),
    resumenes: vi.fn(() => Promise.resolve(new Map())),
    actualizarContadores: vi.fn(() => Promise.resolve()),
  };
  const tipos = { findPorIds: vi.fn(() => Promise.resolve([FULL_GLOSS, OZONO])) };
  const usuarios = { nombres: vi.fn(() => Promise.resolve(new Map<string, string>())) };
  const config = { get: vi.fn(() => 'Europe/Lisbon') };
  const servicio = new AtencionesService(
    atencionModel as unknown as Model<Atencion>,
    contadorModel as unknown as Model<Contador>,
    clientes as unknown as ClientesService,
    tipos as unknown as TiposServicioService,
    usuarios as unknown as UsuariosService,
    config as unknown as ConfigService<AppConfig, true>,
  );
  return { servicio, atencionModel, clientes, tipos };
}

const DTO: CreateAtencionDto = {
  tipoVehiculo: 'suv',
  items: [{ tipoServicioId: FULL_GLOSS._id.toString() }, { tipoServicioId: OZONO._id.toString() }],
  metodoPago: 'efectivo',
};

function ayer(): string {
  return new Date(Date.now() - 36 * 3_600_000).toISOString();
}

describe('AtencionesService.create', () => {
  it('copia nombres y precios de lista del catálogo y calcula el total', async () => {
    const { servicio, atencionModel } = crearDependencias();

    const creada = await servicio.create(DTO, EMPLEADO);

    expect(atencionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        numero: 7,
        clienteId: null,
        total: 4500,
        items: [
          expect.objectContaining({ nombre: 'FULL GLOSS', precioLista: 3000, precio: 3000 }),
          expect.objectContaining({ categoria: 'extra', precioLista: 1500, precio: 1500 }),
        ],
      }),
    );
    expect(creada.registradoPor.id).toBe(EMPLEADO.id);
  });

  it('el admin puede cobrar otro precio y agregar un servicio personalizado', async () => {
    const { servicio, atencionModel } = crearDependencias();

    await servicio.create(
      {
        ...DTO,
        items: [
          { tipoServicioId: FULL_GLOSS._id.toString(), precio: 2000 },
          { nombre: 'Limpieza de llantas', precio: 800 },
        ],
      },
      ADMIN,
    );

    expect(atencionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 2800,
        items: [
          expect.objectContaining({ precioLista: 3000, precio: 2000 }),
          expect.objectContaining({
            tipoServicioId: null,
            categoria: 'personalizado',
            precioLista: null,
            precio: 800,
          }),
        ],
      }),
    );
  });

  it('un empleado no puede cambiar precios ni agregar personalizados', async () => {
    const { servicio, atencionModel } = crearDependencias();
    const conDescuento = {
      ...DTO,
      items: [{ tipoServicioId: FULL_GLOSS._id.toString(), precio: 2000 }],
    };

    await expect(servicio.create(conDescuento, EMPLEADO)).rejects.toThrow(
      new ForbiddenException(MENSAJE_PRECIO_ADMIN),
    );
    await expect(
      servicio.create({ ...DTO, items: [{ nombre: 'Llantas', precio: 800 }] }, EMPLEADO),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(atencionModel.create).not.toHaveBeenCalled();
  });

  it('un empleado puede enviar el mismo precio de lista', async () => {
    const { servicio } = crearDependencias();
    await expect(
      servicio.create(
        { ...DTO, items: [{ tipoServicioId: FULL_GLOSS._id.toString(), precio: 3000 }] },
        EMPLEADO,
      ),
    ).resolves.toBeDefined();
  });

  it('rechaza un servicio dado de baja', async () => {
    const { servicio, tipos } = crearDependencias();
    tipos.findPorIds.mockResolvedValue([{ ...FULL_GLOSS, activo: false }]);

    await expect(servicio.create(DTO, ADMIN)).rejects.toThrow(
      new ConflictException('El servicio FULL GLOSS ya no está disponible'),
    );
  });

  it('rechaza un personalizado sin precio', async () => {
    const { servicio } = crearDependencias();
    await expect(
      servicio.create({ ...DTO, items: [{ nombre: 'Llantas' }] }, ADMIN),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza fechas en el futuro', async () => {
    const { servicio } = crearDependencias();
    const manana = new Date(Date.now() + 3_600_000).toISOString();
    await expect(servicio.create({ ...DTO, realizadoEn: manana }, ADMIN)).rejects.toThrow(
      new BadRequestException(MENSAJE_FECHA_FUTURA),
    );
  });

  it('solo el admin registra días anteriores', async () => {
    const { servicio } = crearDependencias();
    await expect(servicio.create({ ...DTO, realizadoEn: ayer() }, EMPLEADO)).rejects.toThrow(
      new ForbiddenException(MENSAJE_DIA_ANTERIOR),
    );
    await expect(servicio.create({ ...DTO, realizadoEn: ayer() }, ADMIN)).resolves.toBeDefined();
  });

  it('con cliente, verifica que esté activo y recalcula sus contadores', async () => {
    const { servicio, atencionModel, clientes } = crearDependencias();
    const clienteId = nuevoId().toString();
    const realizadoEn = new Date();
    atencionModel.findOne.mockReturnValue(query({ realizadoEn }));
    atencionModel.countDocuments.mockReturnValue(query(3));

    await servicio.create({ ...DTO, clienteId }, EMPLEADO);

    expect(clientes.asegurarActivo).toHaveBeenCalledWith(clienteId);
    expect(clientes.actualizarContadores).toHaveBeenCalledWith(clienteId, {
      ultimoServicioEn: realizadoEn,
      totalServicios: 3,
    });
  });
});

describe('AtencionesService.findAll', () => {
  it('el empleado ve solo hoy y no puede pedir otro día', async () => {
    const { servicio, atencionModel } = crearDependencias();

    await expect(
      servicio.findAll({ page: 1, limit: 20, desde: '2020-01-01' }, EMPLEADO),
    ).rejects.toThrow(new ForbiddenException(MENSAJE_OTRO_DIA));

    await servicio.findAll({ page: 1, limit: 20 }, EMPLEADO);
    const [filtro] = atencionModel.find.mock.calls[0] as unknown as [
      { realizadoEn: { $gte: Date; $lt: Date } },
    ];
    const horas = (filtro.realizadoEn.$lt.getTime() - filtro.realizadoEn.$gte.getTime()) / 3.6e6;
    expect(horas).toBeGreaterThanOrEqual(23);
    expect(horas).toBeLessThanOrEqual(25);
  });

  it('filtra por días en la zona del negocio y devuelve el resumen', async () => {
    const { servicio, atencionModel } = crearDependencias();
    atencionModel.aggregate.mockReturnValue({
      exec: () => Promise.resolve([{ cantidad: 2, total: 6000 }]),
    });

    const respuesta = await servicio.findAll(
      { page: 1, limit: 20, desde: '2026-07-10', hasta: '2026-07-10' },
      ADMIN,
    );

    expect(atencionModel.find).toHaveBeenCalledWith(
      {
        estado: 'completada',
        realizadoEn: {
          $gte: new Date('2026-07-09T23:00:00.000Z'),
          $lt: new Date('2026-07-10T23:00:00.000Z'),
        },
      },
      null,
      expect.anything(),
    );
    expect(respuesta.resumen).toEqual({ cantidad: 2, total: 6000 });
  });
});

describe('AtencionesService.anular', () => {
  it('anula y recalcula los contadores del cliente', async () => {
    const { servicio, atencionModel, clientes } = crearDependencias();
    const clienteId = nuevoId();
    const atencion = crearAtencion({ clienteId });
    atencionModel.findById.mockReturnValue(query(atencion));
    atencionModel.findOneAndUpdate.mockReturnValue(
      query({
        ...atencion,
        estado: 'anulada',
        anulacion: { motivo: 'Duplicada', anuladoPor: nuevoId(), anuladoEn: new Date() },
      }),
    );

    const anulada = await servicio.anular(atencion._id.toString(), { motivo: 'Duplicada' }, ADMIN);

    expect(anulada.estado).toBe('anulada');
    expect(clientes.actualizarContadores).toHaveBeenCalledWith(clienteId.toString(), {
      ultimoServicioEn: null,
      totalServicios: 0,
    });
  });

  it('no anula dos veces', async () => {
    const { servicio, atencionModel } = crearDependencias();
    atencionModel.findById.mockReturnValue(query(crearAtencion({ estado: 'anulada' })));

    await expect(servicio.anular(nuevoId().toString(), { motivo: 'x' }, ADMIN)).rejects.toThrow(
      new ConflictException(MENSAJE_YA_ANULADA),
    );
  });

  it('responde 404 si no existe', async () => {
    const { servicio, atencionModel } = crearDependencias();
    atencionModel.findById.mockReturnValue(query(null));
    await expect(servicio.findOne(nuevoId().toString())).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('AtencionesService.update', () => {
  it('el empleado no edita atenciones de días anteriores', async () => {
    const { servicio, atencionModel } = crearDependencias();
    atencionModel.findById.mockReturnValue(query(crearAtencion({ realizadoEn: new Date(ayer()) })));

    await expect(
      servicio.update(nuevoId().toString(), { metodoPago: 'mbway' }, EMPLEADO),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
