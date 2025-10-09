import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
  
    // ✅ Habilitar CORS para el frontend
    app.enableCors({
      origin: 'http://localhost:8080', // ⚠️ URL del frontend
      credentials: true,               // 🔑 Permitir cookies
    });
  
    // 🧼 Middleware para leer cookies
    app.use(cookieParser());
  
    // ✅ Validaciones globales
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
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
