import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

/** Aplana los errores de class-validator en mensajes en español (spec api-architecture). */
export function mensajesDeValidacion(errores: ValidationError[], prefijo = ''): string[] {
  return errores.flatMap((error) => {
    const propiedad = `${prefijo}${error.property}`;
    const propios = Object.entries(error.constraints ?? {}).map(([regla, mensaje]) =>
      regla === 'whitelistValidation' ? `La propiedad ${propiedad} no está permitida` : mensaje,
    );
    return [...propios, ...mensajesDeValidacion(error.children ?? [], `${propiedad}.`)];
  });
}

export function crearValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errores) => new BadRequestException(mensajesDeValidacion(errores)),
  });
}
