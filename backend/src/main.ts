import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Validar variables de entorno críticas
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    logger.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    logger.error('Please configure them in Railway Dashboard → Variables');
    process.exit(1);
  }

  logger.log('✅ All required environment variables are configured');

  // Create app with NestExpressApplication type for Express v5 compatibility
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure Express v5 query parser to use 'extended' mode
  // This maintains compatibility with complex query strings (arrays, nested objects)
  // See: https://docs.nestjs.com/migration-guide#query-parameters-parsing
  app.set('query parser', 'extended');

  // Health check endpoint
  app.getHttpAdapter().get('/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  // CORS - Permitir frontend en Vercel y desarrollo local
  const allowedOrigins = [
    'https://frontend-magnolias.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // Variable de entorno adicional
  ].filter(Boolean); // Eliminar valores undefined

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Magnolias API')
    .setDescription('API REST para el portal de empleo Magnolias')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`💚 Health check available at: http://localhost:${port}/health`);
}
bootstrap();
