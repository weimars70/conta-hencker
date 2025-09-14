import './config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import bcrypt from "bcrypt";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Acueductos API')
    .setDescription('API para sistema de acueductos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const password = "Zxcasd16#";

const saltRounds = 10;
bcrypt.hash(password, saltRounds).then(hash => {
  console.log('hash',hash);
});

  const configService = app.get(ConfigService);
  const databaseUrl = configService.get<string>('DATABASE_URL');
  console.log('DATABASE_URL en main.ts (via ConfigService):', databaseUrl);
  console.log('DATABASE_URL en main.ts (via process.env):', process.env.DATABASE_URL);

  // Test database connection
  const databaseService = app.get(DatabaseService);
  await databaseService.testConnection();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación API: http://localhost:${port}/api/docs`);
  console.log(`🔐 Endpoint de login: http://localhost:${port}/auth/login`);
}

bootstrap();