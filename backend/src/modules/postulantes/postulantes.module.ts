import { Module, forwardRef } from '@nestjs/common';
import { PostulantesService } from './postulantes.service';
import { PostulantesController } from './postulantes.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [PostulantesController],
  providers: [PostulantesService],
  exports: [PostulantesService],
})
export class PostulantesModule {}