import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [PrismaModule, IaModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}
