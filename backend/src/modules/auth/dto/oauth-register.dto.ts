import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { IsValidRut } from '../../../common/decorators/is-valid-rut.decorator';

export class OAuthRegisterDto {
  @ApiProperty({ example: '12.345.678-9' })
  @IsString()
  @IsNotEmpty()
  @IsValidRut()
  rut: string;

  @ApiProperty({ example: 'empresa' })
  @IsString()
  @IsNotEmpty()
  tipoUsuario: 'empresa' | 'postulante';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
