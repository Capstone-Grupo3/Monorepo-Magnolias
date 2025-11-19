import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoIA {
  PENDIENTE = 'PENDIENTE',
  GENERANDO = 'GENERANDO',
  LISTO = 'LISTO',
  ERROR = 'ERROR',
}

export class UpdateCargoIaDto {
  @ApiProperty({
    description: 'CV ideal generado por IA (markdown o texto)',
    example: '# CV Ideal\n\n## Resumen...',
    required: false,
  })
  @IsString()
  @IsOptional()
  cvIdeal?: string;

  @ApiProperty({
    description: 'Array de preguntas generadas por IA',
    example: [
      {
        categoria: 'Experiencia',
        pregunta: '¿Cuántos años tienes trabajando con React?',
        respuestaTipo: 'TEXTO',
        dificultad: 'MEDIA',
        criterioEvaluacion: 'Buscar conocimiento avanzado',
      },
    ],
    required: false,
  })
  @IsObject()
  @IsOptional()
  preguntasJson?: any;

  @ApiProperty({
    description: 'Estado del proceso de generación con IA',
    enum: EstadoIA,
    example: 'LISTO',
    required: false,
  })
  @IsEnum(EstadoIA)
  @IsOptional()
  estadoIA?: EstadoIA;
}
