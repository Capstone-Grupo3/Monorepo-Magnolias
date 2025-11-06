import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('postulaciones')
@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('cv'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear una postulación con CV opcional' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idCargo: { type: 'number', example: 1 },
        respuestasJson: {
          type: 'object',
          example: {
            pregunta_1: 'Tengo 5 años de experiencia',
            pregunta_2: 'Sí, domino TypeScript',
          },
        },
        cv: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CV (PDF, opcional)',
        },
      },
      required: ['idCargo'],
    },
  })
  @ApiResponse({ status: 201, description: 'Postulación creada exitosamente' })
  @ApiResponse({ status: 409, description: 'Ya has postulado a esta Cargo' })
  create(
    @Body() createPostulacionDto: CreatePostulacionDto,
    @Request() req,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    return this.postulacionesService.create(
      createPostulacionDto,
      req.user.userId,
      cv,
    );
  }

  @Get('postulante/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un postulante' })
  @ApiResponse({ status: 200, description: 'Lista de postulaciones del postulante' })
  findByPostulante(@Param('id') postulanteId: string) {
    return this.postulacionesService.findByPostulante(+postulanteId);
  }

  @Get('cargo/:cargoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un cargo específico' })
  @ApiResponse({ status: 200, description: 'Lista de postulaciones para el cargo' })
  findByCargo(@Param('cargoId') cargoId: string) {
    return this.postulacionesService.findByCargo(+cargoId);
  }

  @Get('empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones recibidas por una empresa' })
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.postulacionesService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una postulación por ID' })
  findOne(@Param('id') id: string) {
    return this.postulacionesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar postulación (incluye estado)' })
  update(@Param('id') id: string, @Body() updateEstadoDto: any) {
    return this.postulacionesService.update(+id, updateEstadoDto);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una postulación' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoDto,
  ) {
    return this.postulacionesService.updateEstado(+id, updateEstadoDto.estado);
  }
}
