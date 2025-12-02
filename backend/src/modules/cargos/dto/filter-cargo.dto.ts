import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoContrato, Modalidad, EstadoCargo } from '@prisma/client';

export class FilterCargoDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por texto en título, descripción o empresa',
    example: 'desarrollador',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ubicación',
    example: 'Santiago',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contrato',
    enum: TipoContrato,
    example: 'FULL_TIME',
  })
  @IsOptional()
  @IsEnum(TipoContrato, {
    message: 'Tipo de contrato inválido. Valores permitidos: FULL_TIME, PART_TIME, PRACTICA, FREELANCE',
  })
  tipoContrato?: TipoContrato;

  @ApiPropertyOptional({
    description: 'Filtrar por modalidad',
    enum: Modalidad,
    example: 'REMOTO',
  })
  @IsOptional()
  @IsEnum(Modalidad, {
    message: 'Modalidad inválida. Valores permitidos: PRESENCIAL, REMOTO, HIBRIDO',
  })
  modalidad?: Modalidad;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del cargo',
    enum: EstadoCargo,
    example: 'ACTIVA',
  })
  @IsOptional()
  @IsEnum(EstadoCargo, {
    message: 'Estado inválido. Valores permitidos: ACTIVA, CERRADA, EN_PROCESO',
  })
  estado?: EstadoCargo;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de empresa',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  empresaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de empresa',
    example: 'Tech Corp',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  empresa?: string;

  @ApiPropertyOptional({
    description: 'Salario mínimo',
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salarioMin?: number;

  @ApiPropertyOptional({
    description: 'Salario máximo',
    example: 2000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salarioMax?: number;

  // Paginación
  @ApiPropertyOptional({
    description: 'Número de página (comienza en 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'fechaPublicacion',
    default: 'fechaPublicacion',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'fechaPublicacion';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
