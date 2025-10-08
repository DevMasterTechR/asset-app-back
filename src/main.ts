import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🧼 Habilitar cookie-parser para leer JWT desde cookies
  app.use(cookieParser());

  // ✅ Validaciones globales para DTOs (opcional pero recomendado)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 📄 Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Asset Management API')
    .setDescription('API para gestionar activos, tarjetas SIM, credenciales, etc.')
    .setVersion('1.0')
    .addTag('SIM Cards')
    .addCookieAuth('jwt') // ✅ Soporte visual de autenticación vía cookies
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

