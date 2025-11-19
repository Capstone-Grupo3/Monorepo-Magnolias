import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { PostulantesModule } from './modules/postulantes/postulantes.module';
import { CargoModule } from './modules/cargos/cargos.module';
import { PostulacionesModule } from './modules/postulaciones/postulaciones.module';
import { IaModule } from './modules/ia/ia.module';
import { StorageModule } from './modules/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmpresasModule,
    PostulantesModule,
    CargoModule,
    PostulacionesModule,
    IaModule,
    StorageModule,
    AdminModule,
  ],
})
export class AppModule {}
