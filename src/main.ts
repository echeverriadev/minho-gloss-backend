import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configurarApp } from './app.setup.js';
import { type AppConfig, isOrigenPermitido } from './config/configuration.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.VERCEL) {
    // Detrás del proxy de Vercel: la IP real del cliente llega en X-Forwarded-For.
    app.set('trust proxy', 1);
  }
  const config = app.get(ConfigService<AppConfig, true>);

  configurarApp(app);
  const cors = {
    corsOrigins: config.get('corsOrigins', { infer: true }),
    nodeEnv: config.get('nodeEnv', { infer: true }),
  };
  app.enableCors({
    origin: (
      origen: string | undefined,
      callback: (error: Error | null, permitido?: boolean) => void,
    ) => callback(null, isOrigenPermitido(origen, cors)),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Minho Gloss API')
    .setDescription('API de gestión del autolavado Minho Gloss')
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(config.get('port', { infer: true }));
}
// Sin `await`: en Vercel la función espera a que el módulo termine de cargar
// antes de atender `app.listen`; con `await` ambos se esperan entre sí y la
// petición se queda colgada sin logs.
void bootstrap();
