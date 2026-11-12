import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  TransformResponseInterceptor,
  GlobalHttpExceptionFilter,
  LoggingInterceptor,
  TenantUrlUtil,
} from './common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  // Security headers, request size limits and graceful shutdown (SIGTERM/SIGINT close Mongo cleanly)
  // CSP is relaxed outside production so the Swagger UI can load.
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
  app.enableShutdownHooks();

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  // Fixed origins (landing, admin) from CORS_ORIGINS, plus every store's own
  // subdomain from TENANT_APP_URL (https://<shopId>.vendora.com).
  const tenantOrigin = TenantUrlUtil.originRegex();
  app.enableCors({
    origin: corsOrigins.length > 0 ? [...corsOrigins, tenantOrigin] : true,
    credentials: true,
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors & Exception Filters
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vendora API')
    .setDescription('Vendora Cloud-Based Multi-Tenant Retail POS & ERP Platform API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  // Swagger is off in production unless explicitly enabled.
  if (!isProduction || process.env.SWAGGER_ENABLED === 'true') {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`Vendora API running on http://localhost:${port}/api/v1`);
  if (!isProduction) logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();

