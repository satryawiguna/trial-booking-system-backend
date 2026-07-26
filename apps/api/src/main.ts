import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from '@app/shared/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (different origin/port)
  app.enableCors();

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');

  // Global exception filter (domain exceptions → structured JSON)
  app.useGlobalFilters(new DomainExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger / OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Trial Booking System API')
    .setDescription('REST API for booking trial science/math classes for kids')
    .setVersion('1.0')
    .addTag('trial-classes', 'Trial class management')
    .addTag('bookings', 'Booking lifecycle')
    .addTag('payments', 'Payment processing')
    .addTag('roster', 'Class roster')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
