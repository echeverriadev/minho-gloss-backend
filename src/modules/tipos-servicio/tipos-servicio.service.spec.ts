import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { nuevoId, query } from '../../../test/utils/mock-query.js';
import type { TipoServicio, TipoServicioLean } from './schemas/tipo-servicio.schema.js';
import { calcularPrecio, TiposServicioService } from './tipos-servicio.service.js';

const PRECIOS = { ligeiro: 2500, suv: 3000, monovolume: 3500, carrinha: 4000 };

function crearTipo(datos: Partial<TipoServicioLean> = {}): TipoServicioLean {
  const ahora = new Date();
  return {
    _id: nuevoId(),
    nombre: 'FULL GLOSS',
    nombreNormalizado: 'full gloss',
    descripcion: 'Lavagem completa do veículo',
    categoria: 'servicio',
    modoPrecio: 'por-vehiculo',
    precios: PRECIOS,
    precioUnico: null,
    orden: 3,
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
    ...datos,
  };
}

function crearModelo() {
  return {
    exists: vi.fn(() => query<{ _id: unknown } | null>(null)),
    create: vi.fn((datos: Partial<TipoServicioLean>) =>
      Promise.resolve({ toObject: () => crearTipo(datos) }),
    ),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  };
}

function crearServicio(modelo: ReturnType<typeof crearModelo>) {
  return new TiposServicioService(modelo as unknown as Model<TipoServicio>);
}

describe('calcularPrecio', () => {
  it('usa el precio del tipo de vehículo', () => {
    const tipo = crearTipo();
    expect(calcularPrecio(tipo, 'suv')).toBe(3000);
    expect(calcularPrecio(tipo, 'carrinha')).toBe(4000);
  });

  it('usa el precio único para cualquier vehículo', () => {
    const extra = crearTipo({ modoPrecio: 'unico', precios: null, precioUnico: 1000 });
    expect(calcularPrecio(extra, 'ligeiro')).toBe(1000);
    expect(calcularPrecio(extra, 'monovolume')).toBe(1000);
  });
});

describe('TiposServicioService', () => {
  it('crea un servicio con sus cuatro precios', async () => {
    const modelo = crearModelo();
    const creado = await crearServicio(modelo).create({
      nombre: 'Full Gloss',
      categoria: 'servicio',
      modoPrecio: 'por-vehiculo',
      precios: PRECIOS,
    });

    expect(modelo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombreNormalizado: 'full gloss',
        precios: PRECIOS,
        precioUnico: null,
      }),
    );
    expect(creado.precios).toEqual(PRECIOS);
  });

  it('rechaza un servicio por vehículo sin el precio de Carrinha', async () => {
    const modelo = crearModelo();
    const { carrinha: _carrinha, ...incompletos } = PRECIOS;

    await expect(
      crearServicio(modelo).create({
        nombre: 'FULL GLOSS',
        categoria: 'servicio',
        modoPrecio: 'por-vehiculo',
        precios: incompletos,
      }),
    ).rejects.toThrow(new BadRequestException('Falta el precio para Carrinha'));
  });

  it('rechaza un extra de precio único sin precio', async () => {
    await expect(
      crearServicio(crearModelo()).create({
        nombre: 'Lavagem do motor',
        categoria: 'extra',
        modoPrecio: 'unico',
      }),
    ).rejects.toThrow('Falta el precio único');
  });

  it('rechaza un título repetido sin distinguir mayúsculas', async () => {
    const modelo = crearModelo();
    modelo.exists.mockReturnValue(query({ _id: nuevoId() }));

    await expect(
      crearServicio(modelo).create({
        nombre: 'express gloss',
        categoria: 'servicio',
        modoPrecio: 'unico',
        precioUnico: 100,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(modelo.exists).toHaveBeenCalledWith(
      expect.objectContaining({ nombreNormalizado: 'express gloss', activo: true }),
    );
  });

  it('al cambiar a precio único descarta los precios por vehículo', async () => {
    const modelo = crearModelo();
    const tipo = crearTipo();
    modelo.findById.mockReturnValue(query(tipo));
    modelo.findByIdAndUpdate.mockReturnValue(
      query({ ...tipo, modoPrecio: 'unico', precios: null, precioUnico: 2000 }),
    );

    await crearServicio(modelo).update(tipo._id.toString(), {
      modoPrecio: 'unico',
      precioUnico: 2000,
    });

    const [, cambios] = modelo.findByIdAndUpdate.mock.calls[0] as unknown as [
      string,
      { $set: Record<string, unknown> },
    ];
    expect(cambios.$set).toMatchObject({ modoPrecio: 'unico', precios: null, precioUnico: 2000 });
  });

  it('al editar un solo precio conserva los demás', async () => {
    const modelo = crearModelo();
    const tipo = crearTipo();
    modelo.findById.mockReturnValue(query(tipo));
    modelo.findByIdAndUpdate.mockReturnValue(query(tipo));

    await crearServicio(modelo).update(tipo._id.toString(), { precios: { suv: 3200 } });

    const [, cambios] = modelo.findByIdAndUpdate.mock.calls[0] as unknown as [
      string,
      { $set: Record<string, unknown> },
    ];
    expect(cambios.$set.precios).toEqual({ ...PRECIOS, suv: 3200 });
  });
});
