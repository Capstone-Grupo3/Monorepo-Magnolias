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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PostulantesService } from './postulantes.service';
import { CreatePostulanteDto } from './dto/create-postulante.dto';
import { UpdatePostulanteDto } from './dto/update-postulante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../auth/guards/rate-limit.guard';
import { EmailService } from '../auth/services/email.service';
import { VerificationService } from '../auth/services/verification.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Postulantes')
@Controller('Postulantes')
export class PostulantesController {
  constructor(
    private readonly PostulantesService: PostulantesService,
    private readonly emailService: EmailService,
    private readonly verificationService: VerificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Registrar un nuevo postulante' })
  @ApiResponse({ status: 201, description: 'Postulante creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo o RUT ya está registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos de registro' })
  async create(@Body() createPostulanteDto: CreatePostulanteDto, @Ip() ip: string) {
    const postulante = await this.PostulantesService.create(createPostulanteDto, ip);

    // Generar token de verificación
    const token = this.verificationService.generarToken();
    const expiracion = this.verificationService.calcularExpiracion();

    await this.prisma.postulante.update({
      where: { id: postulante.id },
      data: {
        tokenVerificacion: token,
        tokenExpiracion: expiracion,
      },
    });

    // Enviar email de verificación
    await this.emailService.enviarEmailVerificacion(
      postulante.correo,
      postulante.nombre,
      token,
      'postulante',
    );

    return {
      ...postulante,
      mensaje: 'Postulante registrado. Por favor verifica tu correo electrónico.',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del postulante autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del postulante' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getMe(@Request() req) {
    return this.PostulantesService.findOne(req.user.userId);
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todos los Postulantes' })
  findAll() {
    return this.PostulantesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un postulante por ID' })
  @ApiResponse({ status: 200, description: 'postulante encontrado' })
  @ApiResponse({ status: 404, description: 'postulante no encontrado' })
  findOne(@Param('id') id: string) {
    return this.PostulantesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar datos de un postulante' })
  @ApiResponse({ status: 200, description: 'postulante actualizado' })
  update(
    @Param('id') id: string,
    @Body() updatePostulanteDto: UpdatePostulanteDto,
    @Request() req,
  ) {
    // Validar que solo pueda actualizar su propio perfil
    if (+id !== req.user.userId) {
      throw new BadRequestException('No puedes actualizar el perfil de otro usuario');
    }
    return this.PostulantesService.update(+id, updatePostulanteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar un postulante' })
  remove(@Param('id') id: string) {
    return this.PostulantesService.remove(+id);
  }
}
