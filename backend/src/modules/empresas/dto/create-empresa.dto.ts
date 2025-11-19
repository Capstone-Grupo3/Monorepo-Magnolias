import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidRut } from '../../../common/decorators/is-valid-rut.decorator';

export class CreateEmpresaDto {
  @ApiProperty({ example: '76.123.456-7' })
  @IsString()
  @IsNotEmpty()
  @IsValidRut()
  rut: string;

  @ApiProperty({ example: 'Tech Solutions SA' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'empresa@techsolutions.com' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(6)
  contrasena?: string;

  @ApiProperty({
    example: 'Empresa de tecnología e innovación',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ required: false, description: 'ID de LinkedIn para OAuth' })
  @IsString()
  @IsOptional()
  linkedinId?: string;

  @ApiProperty({ required: false, description: 'ID de Google para OAuth' })
  @IsString()
  @IsOptional()
  googleId?: string;
}
