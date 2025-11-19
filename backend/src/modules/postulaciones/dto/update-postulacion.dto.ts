// backend/src/modules/postulaciones/dto/update-postulacion.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePostulacionDto } from './create-postulacion.dto';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoPostulacion } from '@prisma/client';

export class UpdatePostulacionDto extends PartialType(CreatePostulacionDto) {
  @IsOptional()
  @IsNumber()
  puntajeIa?: number;

  @IsOptional()
  @IsString()
  feedbackIa?: string;

  @IsOptional()
  @IsEnum(EstadoPostulacion)
  estado?: EstadoPostulacion;
}
