import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { nuevoId, query } from '../../../test/utils/mock-query.js';
import type { UsuarioSesion } from '../../common/auth/usuario-sesion.js';
import { ClientesService, filtroBusqueda, MENSAJE_YA_ANONIMIZADO } from './clientes.service.js';
import type { CreateClienteDto } from './dto/create-cliente.dto.js';
import type { Cliente, ClienteLean } from './schemas/cliente.schema.js';

const ADMIN: UsuarioSesion = { id: 'a', nombre: 'Admin', email: 'a@x.pt', rol: 'admin' };
const EMPLEADO: UsuarioSesion = { id: 'e', nombre: 'Empleado', email: 'e@x.pt', rol: 'empleado' };

const DTO: CreateClienteDto = {
  nombre: 'José',
  apellido: 'Pérez',
  cedula: '123456789ZZ4',
  telefono: '+351912345678',
  email: 'jose@example.com',
  direccion: 'Rua do Souto 25, Braga',
  fechaNacimiento: '1985-04-12',
  aceptaContacto: true,
};

function crearCliente(datos: Partial<ClienteLean> = {}): ClienteLean {
  const ahora = new Date();
  return {
    _id: nuevoId(),
    ...DTO,
    notas: null,
    activo: true,
    anonimizado: false,
    ultimoServicioEn: null,
    totalServicios: 0,
    busqueda: 'jose perez',
    createdAt: ahora,
    updatedAt: ahora,
    ...datos,
  };
}

function crearModelo() {
  return {
    create: vi.fn((datos: Partial<ClienteLean>) =>
      Promise.resolve({ toObject: () => crearCliente(datos) }),
    ),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn((_filtro: Record<string, unknown>) => query<ClienteLean | null>(null)),
    findByIdAndUpdate: vi.fn(),
    updateOne: vi.fn(() => query({ acknowledged: true })),
  };
}

function crearServicio(modelo: ReturnType<typeof crearModelo>) {
  return new ClientesService(modelo as unknown as Model<Cliente>);
}

describe('ClientesService', () => {
  it('crea el cliente con el texto de búsqueda sin tildes', async () => {
    const modelo = crearModelo();
    const creado = await crearServicio(modelo).create(DTO);

    expect(modelo.create).toHaveBeenCalledWith(expect.objectContaining({ busqueda: 'jose perez' }));
    expect(creado).toMatchObject({ nombre: 'José', telefono: '+351912345678' });
    expect(creado).not.toHaveProperty('busqueda');
  });

  it('rechaza una cédula ya usada por otro cliente activo', async () => {
    const modelo = crearModelo();
    const otro = crearCliente({ nombre: 'Ana', apellido: 'Silva' });
    modelo.findOne.mockImplementation((filtro: Record<string, unknown>) =>
      query('cedula' in filtro ? otro : null),
    );

    const error = await crearServicio(modelo)
      .create(DTO)
      .catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toEqual({
      message: 'La cédula ya está registrada para Ana Silva',
      campo: 'cedula',
      clienteId: otro._id.toString(),
    });
    expect(modelo.create).not.toHaveBeenCalled();
  });

  it('rechaza un teléfono ya usado por otro cliente activo', async () => {
    const modelo = crearModelo();
    const otro = crearCliente({ nombre: 'Ana', apellido: 'Silva' });
    modelo.findOne.mockImplementation((filtro: Record<string, unknown>) =>
      query('telefono' in filtro ? otro : null),
    );

    await expect(crearServicio(modelo).create(DTO)).rejects.toThrow(
      'El teléfono ya está registrado para Ana Silva',
    );
  });

  it('al editar ignora al propio cliente en la verificación de duplicados', async () => {
    const modelo = crearModelo();
    const cliente = crearCliente();
    modelo.findOne.mockImplementation((filtro: Record<string, unknown>) =>
      query('activo' in filtro && '_id' in filtro && !('telefono' in filtro) ? cliente : null),
    );
    modelo.findByIdAndUpdate.mockReturnValue(query({ ...cliente, telefono: '+351911111111' }));

    await crearServicio(modelo).update(cliente._id.toString(), { telefono: '+351911111111' });

    expect(modelo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ telefono: '+351911111111', _id: { $ne: cliente._id.toString() } }),
    );
  });

  it('no muestra la ficha de un cliente inactivo a un empleado', async () => {
    const modelo = crearModelo();
    const inactivo = crearCliente({ activo: false });
    modelo.findById.mockReturnValue(query(inactivo));

    await expect(
      crearServicio(modelo).findOne(inactivo._id.toString(), EMPLEADO, true),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('muestra la ficha de un cliente inactivo al admin que lo pide', async () => {
    const modelo = crearModelo();
    const inactivo = crearCliente({ activo: false });
    modelo.findById.mockReturnValue(query(inactivo));

    const ficha = await crearServicio(modelo).findOne(inactivo._id.toString(), ADMIN, true);
    expect(ficha.activo).toBe(false);
  });

  it('da de baja con baja lógica', async () => {
    const modelo = crearModelo();
    const cliente = crearCliente();
    modelo.findOne.mockReturnValue(query(cliente));

    await crearServicio(modelo).remove(cliente._id.toString());

    expect(modelo.updateOne).toHaveBeenCalledWith(
      { _id: cliente._id.toString() },
      { $set: { activo: false } },
    );
  });

  it('anonimiza borrando todos los datos personales', async () => {
    const modelo = crearModelo();
    const cliente = crearCliente();
    modelo.findById.mockReturnValue(query(cliente));

    await crearServicio(modelo).anonimizar(cliente._id.toString());

    const [, cambios] = modelo.updateOne.mock.calls[0] as unknown as [
      unknown,
      { $set: Record<string, unknown>; $unset: Record<string, 1> },
    ];
    expect(cambios.$set).toMatchObject({
      nombre: 'Cliente',
      apellido: 'eliminado',
      aceptaContacto: false,
      activo: false,
      anonimizado: true,
    });
    expect(Object.keys(cambios.$unset).toSorted()).toEqual(
      ['cedula', 'direccion', 'email', 'fechaNacimiento', 'notas', 'telefono'].toSorted(),
    );
  });

  it('no anonimiza dos veces al mismo cliente', async () => {
    const modelo = crearModelo();
    modelo.findById.mockReturnValue(query(crearCliente({ anonimizado: true })));

    await expect(crearServicio(modelo).anonimizar(nuevoId().toString())).rejects.toThrow(
      MENSAJE_YA_ANONIMIZADO,
    );
  });
});

describe('filtroBusqueda', () => {
  it('no filtra sin texto', () => {
    expect(filtroBusqueda(undefined)).toEqual({});
    expect(filtroBusqueda('  ')).toEqual({});
  });

  it('busca por inicio de palabra sin tildes', () => {
    const { $or } = filtroBusqueda('Pérez') as { $or: Record<string, RegExp>[] };
    expect($or[0].busqueda.test('jose perez')).toBe(true);
    expect($or[0].busqueda.test('jose lopez')).toBe(false);
  });

  it('busca teléfonos por sus dígitos', () => {
    const { $or } = filtroBusqueda('912 34') as { $or: Record<string, RegExp>[] };
    const telefono = $or.find((condicion) => 'telefono' in condicion)?.telefono;
    expect(telefono?.test('+351912345678')).toBe(true);
  });

  it('busca cédulas por prefijo normalizado', () => {
    const { $or } = filtroBusqueda('1234 56') as { $or: Record<string, RegExp>[] };
    const cedula = $or.find((condicion) => 'cedula' in condicion)?.cedula;
    expect(cedula?.test('123456789ZZ4')).toBe(true);
  });

  it('escapa caracteres especiales de expresiones regulares', () => {
    expect(() => filtroBusqueda('(.*')).not.toThrow();
  });
});
