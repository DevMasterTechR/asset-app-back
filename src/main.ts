import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Habilita shutdown hooks de NestJS
  app.enableShutdownHooks();

  // 🔒 Middleware y config
  app.enableCors({
      origin: [
    'http://192.168.50.95:8080',
    'http://localhost:8080',
    'http://localhost:3000',   
    'http://localhost:5173'    
  ],
    credentials: true,
  });
  app.use(cookieParser());
  // Temporal: loguear el body crudo para depuración de clientes (antes de ValidationPipe)
  // Útil para ver exactamente qué envía el frontend cuando recibimos 400 de validación.
  app.use((req, _res, next) => {
    try {
      console.log('[HTTP]', req.method, req.url, 'body:', JSON.stringify(req.body));
    } catch (e) {
      console.log('[HTTP]', req.method, req.url, 'body: <unserializable>');
    }
    next();
  });
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
