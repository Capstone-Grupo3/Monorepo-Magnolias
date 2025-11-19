import { PartialType } from '@nestjs/swagger';
import { CreateCargoDto } from './create-cargo.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoCargo } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCargoDto extends PartialType(CreateCargoDto) {
  @ApiProperty({ enum: EstadoCargo, required: false })
  @IsEnum(EstadoCargo)
  @IsOptional()
  estado?: EstadoCargo;
}
