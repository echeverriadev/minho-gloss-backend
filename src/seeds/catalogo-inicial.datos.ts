import type { CreateTipoServicioDto } from '../modules/tipos-servicio/dto/create-tipo-servicio.dto.js';

/** Precios en euros (Ligeiro, SUV, Monovolume, Carrinha) → céntimos por tipo de vehículo. */
function porVehiculo(ligeiro: number, suv: number, monovolume: number, carrinha: number) {
  return {
    modoPrecio: 'por-vehiculo' as const,
    precios: {
      ligeiro: ligeiro * 100,
      suv: suv * 100,
      monovolume: monovolume * 100,
      carrinha: carrinha * 100,
    },
  };
}

function unico(euros: number) {
  return { modoPrecio: 'unico' as const, precioUnico: euros * 100 };
}

// Catálogo del negocio a octubre de 2026. En los extras con dos precios se asume que el primero
// es para Ligeiro y SUV y el segundo para Monovolume y Carrinha (design de add-catalogo-servicios).
export const CATALOGO_INICIAL: CreateTipoServicioDto[] = [
  {
    nombre: 'ASPIRAÇÃO',
    descripcion: 'Aspiração e limpeza do interior',
    categoria: 'servicio',
    orden: 1,
    ...porVehiculo(13, 16, 19, 25),
  },
  {
    nombre: 'EXPRESS GLOSS',
    descripcion: 'Lavagem rápida e eficiente',
    categoria: 'servicio',
    orden: 2,
    ...porVehiculo(17, 20, 25, 30),
  },
  {
    nombre: 'FULL GLOSS',
    descripcion: 'Lavagem completa do veículo',
    categoria: 'servicio',
    orden: 3,
    ...porVehiculo(25, 30, 35, 40),
  },
  {
    nombre: 'PREMIUM GLOSS',
    descripcion: 'Limpeza detalhada do veículo',
    categoria: 'servicio',
    orden: 4,
    ...porVehiculo(60, 65, 70, 75),
  },
  {
    nombre: 'EXTERIOR GLOSS',
    descripcion: 'Lavagem exterior completa',
    categoria: 'servicio',
    orden: 5,
    ...porVehiculo(12, 14, 16, 18),
  },
  {
    nombre: 'Lavagem de estofos',
    categoria: 'extra',
    orden: 1,
    ...porVehiculo(50, 50, 70, 70),
  },
  {
    nombre: 'Polimento de faróis',
    categoria: 'extra',
    orden: 2,
    ...porVehiculo(60, 60, 80, 80),
  },
  { nombre: 'Lavagem do motor', categoria: 'extra', orden: 3, ...unico(40) },
  { nombre: 'Remoção de pelos de animais', categoria: 'extra', orden: 4, ...unico(10) },
  { nombre: 'Higienização com ozono', categoria: 'extra', orden: 5, ...unico(10) },
];
