import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificarEmailDto {
  @ApiProperty({ example: 'abc123def456...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ReenviarVerificacionDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsString()
  @IsNotEmpty()
  correo: string;
}
