import { IsNotEmpty, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreatePostulacionDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  idCargo: number;

  @ApiProperty({
    example: {
      pregunta_1: 'Tengo 5 años de experiencia con React',
      pregunta_2: 'Sí, he trabajado extensamente con TypeScript',
    },
    required: false,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @IsOptional()
  respuestasJson?: any;

  @ApiProperty({
    description: 'URL del CV subido (opcional, puede ser del perfil del postulante)',
    required: false,
  })
  @IsString()
  @IsOptional()
  cvUrl?: string;
}
