import { IsString, IsEmail, IsOptional, IsEnum, MinLength, Matches } from 'class-validator';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export class UpdatePostulanteDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/, {
    message: 'RUT inválido. Formato esperado: 12.345.678-9',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEnum(EstadoUsuario, { message: 'Estado inválido' })
  estado?: EstadoUsuario;
}

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}[-][0-9kK]{1}$/, {
    message: 'RUT inválido. Formato esperado: 12.345.678-9',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  sitioWeb?: string;

  @IsOptional()
  @IsEnum(EstadoUsuario, { message: 'Estado inválido' })
  estado?: EstadoUsuario;
}
