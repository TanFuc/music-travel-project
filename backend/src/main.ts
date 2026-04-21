import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { EnhancedLoggingInterceptor } from './common/interceptors/enhanced-logging.interceptor';
import { NormalizeBookingBodyPipe } from './modules/bookings/pipes/normalize-booking-body.pipe';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.setGlobalPrefix(apiPrefix);
  await app.register(import('@fastify/cors'), {
    origin: corsOrigins.split(','),
    credentials: true,
  });
  await app.register(import('@fastify/compress'));
  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: false,
  });
  await app.register(import('@fastify/multipart'), {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });
  app.useGlobalPipes(
    new NormalizeBookingBodyPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new EnhancedLoggingInterceptor());
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Music & Travel Booking API')
      .setDescription('API documentation for the Music & Travel Booking Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('shows', 'Entertainment shows')
      .addTag('tickets', 'Ticket management')
      .addTag('tours', 'Tour packages')
      .addTag('bookings', 'Booking operations')
      .addTag('payments', 'Payment processing')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
bootstrap();
