import type { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { crearValidationPipe } from './common/validation/validation-pipe.js';

/** Configuración HTTP común a `main.ts` y a las pruebas e2e. */
export function configurarApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(crearValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
}
