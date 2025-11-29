import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export enum EstadoCargo {
  ACTIVA = 'ACTIVA',
  CERRADA = 'CERRADA',
  PAUSADA = 'PAUSADA',
}

export enum ModalidadCargo {
  PRESENCIAL = 'PRESENCIAL',
  REMOTO = 'REMOTO',
  HIBRIDO = 'HIBRIDO',
}

export enum TipoContrato {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  PRACTICA = 'PRACTICA',
  FREELANCE = 'FREELANCE',
}

export class UpdateCargoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsEnum(ModalidadCargo, { message: 'Modalidad inválida' })
  modalidad?: ModalidadCargo;

  @IsOptional()
  @IsEnum(TipoContrato, { message: 'Tipo de contrato inválido' })
  tipoContrato?: TipoContrato;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioEstimado?: number;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsOptional()
  @IsEnum(EstadoCargo, { message: 'Estado inválido' })
  estado?: EstadoCargo;
}

export class CreateCargoAdminDto {
  @IsNumber()
  idEmpresa: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  ubicacion: string;

  @IsEnum(ModalidadCargo)
  modalidad: ModalidadCargo;

  @IsEnum(TipoContrato)
  tipoContrato: TipoContrato;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioEstimado?: number;

  @IsOptional()
  @IsString()
  requisitos?: string;
}
