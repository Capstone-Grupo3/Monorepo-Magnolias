import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CargoService } from './cargos.service';
import { CargoController } from './cargos.controller';

@Module({
  imports: [HttpModule],
  controllers: [CargoController],
  providers: [CargoService],
  exports: [CargoService],
})
export class CargoModule {}
