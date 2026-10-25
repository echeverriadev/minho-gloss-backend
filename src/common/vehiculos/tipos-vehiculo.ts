// Medios de transporte con los que trabaja el negocio (domain-model), en el orden de sus precios.
export const TIPOS_VEHICULO = ['ligeiro', 'suv', 'monovolume', 'carrinha'] as const;
export type TipoVehiculo = (typeof TIPOS_VEHICULO)[number];

export const ETIQUETA_TIPO_VEHICULO: Record<TipoVehiculo, string> = {
  ligeiro: 'Ligeiro',
  suv: 'SUV',
  monovolume: 'Monovolume',
  carrinha: 'Carrinha',
};
