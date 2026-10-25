import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { TiposServicioService } from '../modules/tipos-servicio/tipos-servicio.service.js';
import { CATALOGO_INICIAL } from './catalogo-inicial.datos.js';

/** `npm run seed:catalogo`: carga el catálogo del negocio solo si todavía está vacío. */
async function cargarCatalogo(): Promise<void> {
  const logger = new Logger('CatalogoInicial');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  try {
    const tiposServicio = app.get(TiposServicioService);
    if (!(await tiposServicio.estaVacio())) {
      logger.log('El catálogo ya tiene servicios: no se cargó nada');
      return;
    }
    for (const tipo of CATALOGO_INICIAL) {
      // oxlint-disable-next-line no-await-in-loop -- en orden, para que el log sea legible
      await tiposServicio.create(tipo);
    }
    logger.log(`Se cargaron ${CATALOGO_INICIAL.length} servicios y extras`);
  } finally {
    await app.close();
  }
}

await cargarCatalogo();
