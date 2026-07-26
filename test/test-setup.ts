import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../apps/api/src/app.module';
import { DomainExceptionFilter } from '@app/shared/filters';

/**
 * Creates a fully configured NestJS test application with:
 * - Global pipes (ValidationPipe)
 * - Global filters (DomainExceptionFilter)
 * - All modules wired (AppModule)
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  await app.init();
  return app;
}
