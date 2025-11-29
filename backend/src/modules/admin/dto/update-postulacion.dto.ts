import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum EstadoPostulacion {
  PENDIENTE = 'PENDIENTE',
  EVALUADO = 'EVALUADO',
  EN_REVISION = 'EN_REVISION',
  SELECCIONADO = 'SELECCIONADO',
  RECHAZADO = 'RECHAZADO',
}

export class UpdatePostulacionDto {
  @IsOptional()
  @IsEnum(EstadoPostulacion, { message: 'Estado inválido' })
  estado?: EstadoPostulacion;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El puntaje debe ser al menos 0' })
  @Max(100, { message: 'El puntaje no puede superar 100' })
  puntajeIa?: number;

  @IsOptional()
  @IsString()
  notasAdmin?: string;
}
