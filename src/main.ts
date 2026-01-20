import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  // Soportar HTTPS en desarrollo/producción si se proporcionan certificados
  let httpsOptions: any = undefined;
  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;
  if (keyPath && certPath) {
    try {
      httpsOptions = {
        key: fs.readFileSync(path.resolve(keyPath)),
        cert: fs.readFileSync(path.resolve(certPath)),
      };
      // Starting with HTTPS enabled (no verbose log)
    } catch (e) {
      console.warn('[main] Could not read SSL files, starting HTTP. Error:', e && e.message ? e.message : e);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });

  // ✅ Habilita shutdown hooks de NestJS
  app.enableShutdownHooks();
  
  // Desactivar ETag a nivel de aplicación para evitar respuestas 304
  // automáticas basadas en If-None-Match. Esto asegura que endpoints
  // como /auth/session devuelvan contenido fresco en cada petición.
  app.set('etag', false);

  // 🔒 Middleware y config
  app.enableCors({
      origin: [
    'http://192.168.50.95:8080',
    'http://localhost:8080',
    'http://localhost:5173',
    'https://asset-app-front.vercel.app/'
  ],
    credentials: true,
  });
  app.use(cookieParser());
  // Ensure JSON body is parsed before our debug logger so we can inspect parsed body
  app.use(express.json());
  // Note: request body debug logging removed to avoid noisy logs in production/dev.
  // Enable transform so DTO numeric/string types are converted (e.g. "1" -> 1)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 📄 Swagger
  const config = new DocumentBuilder()
    .setTitle('Asset Management API')
    .setDescription('API para gestionar activos, tarjetas SIM, credenciales, etc.')
    .setVersion('1.1')
    .addCookieAuth('jwt')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
