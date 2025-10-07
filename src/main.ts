import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 📄 Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Asset Management API')
    .setDescription('API para gestionar activos, tarjetas SIM, credenciales, etc.')
    .setVersion('1.0')
    .addTag('SIM Cards') // puedes agregar más tags por módulo
    // .addBearerAuth() // Descomenta si usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
