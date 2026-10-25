import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  [extra: string]: unknown;
}

const NOMBRES_ESTADO: Partial<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
};

const MENSAJES_POR_DEFECTO: Partial<Record<number, string>> = {
  401: 'Debes iniciar sesión',
  403: 'No tienes permiso para esta acción',
  404: 'Recurso no encontrado',
  429: 'Demasiadas solicitudes, espera un momento',
};

const MONGO_DUPLICATE_KEY = 11_000;

/** Unifica todas las respuestas de error con el formato de la spec api-architecture. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const original = exception.getResponse();
      const extra = typeof original === 'object' ? original : {};
      const message = mensajeDe(original) ?? MENSAJES_POR_DEFECTO[statusCode] ?? exception.message;
      return {
        ...extra,
        statusCode,
        error: NOMBRES_ESTADO[statusCode] ?? HttpStatus[statusCode] ?? 'Error',
        message,
      };
    }

    // Respaldo por si dos peticiones simultáneas pasan la verificación previa de duplicados.
    if (esDuplicadoMongo(exception)) {
      return {
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'Ya existe un registro con esos datos',
      };
    }

    this.logger.error(
      exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
    );
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Error interno del servidor',
    };
  }
}

function mensajeDe(original: string | object): string | string[] | undefined {
  if (typeof original === 'string') {
    return original;
  }
  if ('message' in original) {
    const { message } = original;
    if (typeof message === 'string' || Array.isArray(message)) {
      return message as string | string[];
    }
  }
  return undefined;
}

function esDuplicadoMongo(exception: unknown): boolean {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'code' in exception &&
    exception.code === MONGO_DUPLICATE_KEY
  );
}
