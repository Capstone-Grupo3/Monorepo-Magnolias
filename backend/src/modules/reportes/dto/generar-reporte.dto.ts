import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerarReporteDto {
  @IsInt()
  @Type(() => Number)
  cargoId: number;

  @IsOptional()
  @IsBoolean()
  incluirTodos?: boolean = false;

  @IsOptional()
  @IsBoolean()
  enviarEmail?: boolean = true;
}
