import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../auth/guards/rate-limit.guard';
import { EmailService } from '../auth/services/email.service';
import { VerificationService } from '../auth/services/verification.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly emailService: EmailService,
    private readonly verificationService: VerificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Registrar una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo o RUT ya está registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos de registro' })
  async create(@Body() createEmpresaDto: CreateEmpresaDto, @Ip() ip: string) {
    const empresa = await this.empresasService.create(createEmpresaDto, ip);

    // Generar token de verificación
    const token = this.verificationService.generarToken();
    const expiracion = this.verificationService.calcularExpiracion();

    await this.prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        tokenVerificacion: token,
        tokenExpiracion: expiracion,
      },
    });

    // Enviar email de verificación
    await this.emailService.enviarEmailVerificacion(
      empresa.correo,
      empresa.nombre,
      token,
      'empresa',
    );

    return {
      ...empresa,
      mensaje: 'Empresa registrada. Por favor verifica tu correo electrónico.',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil de la empresa autenticada' })
  @ApiResponse({ status: 200, description: 'Perfil de la empresa' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getMe(@Request() req) {
    return this.empresasService.findOne(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas' })
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar datos de una empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada' })
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(+id, updateEmpresaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar una empresa' })
  remove(@Param('id') id: string) {
    return this.empresasService.remove(+id);
  }
}
