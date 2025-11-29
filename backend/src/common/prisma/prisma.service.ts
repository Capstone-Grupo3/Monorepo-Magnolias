import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    
    // Agregar parámetros de pool de conexiones más conservadores para Supabase free tier
    // connection_limit=3 para evitar saturar el pooler de Supabase
    const urlWithPooling = databaseUrl?.includes('connection_limit') 
      ? databaseUrl 
      : `${databaseUrl}${databaseUrl?.includes('?') ? '&' : '?'}connection_limit=3&pool_timeout=20`;

    super({
      datasources: {
        db: {
          url: urlWithPooling,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Database connected successfully');
        return;
      } catch (error) {
        retries--;
        this.logger.warn(`Database connection attempt failed. Retries left: ${retries}`);
        if (retries === 0) {
          this.logger.error('❌ Failed to connect to database:', error);
          throw error;
        }
        // Esperar 2 segundos antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  // Método helper para ejecutar consultas con retry
  async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        // Solo reintentar en errores de conexión
        if (error.code === 'P1001' || error.code === 'P2024') {
          this.logger.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
  }
}
