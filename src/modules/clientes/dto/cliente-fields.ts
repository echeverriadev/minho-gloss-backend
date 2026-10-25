import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  registerDecorator,
} from 'class-validator';
import { normalizarCedula } from '../../../common/normalizacion/normalizacion.js';
import { Trim, TrimLowercase } from '../../../common/validation/transforms.js';
import { NormalizarTelefono } from './normalizar-telefono.transform.js';

export const FECHA_MINIMA_NACIMIENTO = '1900-01-01';

/** Hoy como `YYYY-MM-DD` en la zona del negocio, para comparar fechas de calendario. */
export function hoyEnLisboa(ahora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(ahora);
}

function esFechaReal(valor: string): boolean {
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
}

function FechaNacimientoValida(): PropertyDecorator {
  return (target, propertyName) => {
    registerDecorator({
      name: 'fechaNacimiento',
      target: target.constructor,
      propertyName: propertyName.toString(),
      validator: {
        validate: (valor: unknown) =>
          typeof valor === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
          esFechaReal(valor) &&
          valor >= FECHA_MINIMA_NACIMIENTO &&
          valor <= hoyEnLisboa(),
        defaultMessage: (args) => {
          const valor = args?.value;
          if (typeof valor === 'string' && esFechaReal(valor) && valor > hoyEnLisboa()) {
            return 'La fecha de nacimiento no puede ser futura';
          }
          return 'La fecha de nacimiento debe ser una fecha válida con formato AAAA-MM-DD, posterior a 1900';
        },
      },
    });
  };
}

export const NombreRules = (campo: 'nombre' | 'apellido') => {
  const etiqueta = campo === 'nombre' ? 'El nombre' : 'El apellido';
  return applyDecorators(
    Trim(),
    IsString({ message: `${etiqueta} debe ser un texto` }),
    Length(2, 60, { message: `${etiqueta} debe tener entre 2 y 60 caracteres` }),
  );
};

export const CedulaRules = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? normalizarCedula(value) : value,
    ),
    IsString({ message: 'La cédula debe ser un texto' }),
    Matches(/^[A-Z0-9]{4,20}$/, {
      message: 'La cédula debe tener entre 4 y 20 letras o números',
    }),
  );

export const TelefonoRules = () =>
  applyDecorators(
    NormalizarTelefono(),
    IsString({ message: 'El teléfono no es válido' }),
    Matches(/^\+\d{8,15}$/, {
      message: 'El teléfono no es válido: usa entre 8 y 15 dígitos, por ejemplo 912 345 678',
    }),
  );

export const EmailRules = () =>
  applyDecorators(
    TrimLowercase(),
    IsEmail({}, { message: 'El correo no es válido' }),
    MaxLength(120, { message: 'El correo no puede superar los 120 caracteres' }),
  );

export const DireccionRules = () =>
  applyDecorators(
    Trim(),
    IsString({ message: 'La dirección debe ser un texto' }),
    Length(5, 200, { message: 'La dirección debe tener entre 5 y 200 caracteres' }),
  );

export const FechaNacimientoRules = () => applyDecorators(Trim(), FechaNacimientoValida());

export const AceptaContactoRules = () =>
  applyDecorators(IsBoolean({ message: 'aceptaContacto debe ser true o false' }));

export const NotasRules = () =>
  applyDecorators(
    IsOptional(),
    Trim(),
    IsString({ message: 'Las notas deben ser un texto' }),
    MaxLength(500, { message: 'Las notas no pueden superar los 500 caracteres' }),
  );
