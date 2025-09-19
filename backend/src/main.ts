import './config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 CORS habilitado
  app.enableCors();

  // 👉 Validaciones globales
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Acueductos API')
    .setDescription('API para sistema de acueductos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Levantar servidor
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicación ejecutándose en puerto ${port}`);
}

bootstrap();
