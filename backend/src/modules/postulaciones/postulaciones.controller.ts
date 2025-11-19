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
  ParseIntPipe,
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

  // =====================================================
  // POST /postulaciones  -> crear postulación + CV opcional
  // =====================================================
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

  // =====================================================
  // GET /postulaciones/postulante/:id
  // =====================================================
  @Get('postulante/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un postulante' })
  @ApiResponse({
    status: 200,
    description: 'Lista de postulaciones del postulante',
  })
  findByPostulante(@Param('id', ParseIntPipe) postulanteId: number) {
    return this.postulacionesService.findByPostulante(postulanteId);
  }

  // =====================================================
  // GET /postulaciones/cargo/:cargoId
  // =====================================================
  @Get('cargo/:cargoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones de un cargo específico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de postulaciones para el cargo',
  })
  findByCargo(@Param('cargoId', ParseIntPipe) cargoId: number) {
    return this.postulacionesService.findByCargo(cargoId);
  }

  // =====================================================
  // GET /postulaciones/empresa/:empresaId
  // =====================================================
  @Get('empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener postulaciones recibidas por una empresa' })
  findByEmpresa(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return this.postulacionesService.findByEmpresa(empresaId);
  }

  // =====================================================
  // GET /postulaciones/:id
  // =====================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una postulación por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postulacionesService.findOne(id);
  }

  // =====================================================
  // PATCH /postulaciones/:id
  //  -> usado por n8n para actualizar puntajeIa, feedbackIa y estado
  // =====================================================
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar postulación (incluye estado y puntajes IA)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        puntajeIa: {
          type: 'number',
          example: 78,
          description: 'Puntaje global IA (0-100)',
        },
        feedbackIa: {
          type: 'string',
          example: '=== ANÁLISIS DE POSTULACIÓN === ...',
          description: 'Feedback consolidado de la IA',
        },
        estado: {
          type: 'string',
          example: 'EVALUADO',
          description:
            'Nuevo estado de la postulación (PENDIENTE | EN_REVISION | EVALUADO | RECHAZADO | SELECCIONADO)',
        },
        respuestasJson: {
          type: 'object',
          description: 'Opcional: respuestas actualizadas del formulario',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Postulación actualizada' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    // n8n a veces puede mandar el body como string crudo (raw),
    // así que aquí lo normalizamos para que SIEMPRE sea un objeto.
    let data: any = body;

    if (typeof body === 'string') {
      try {
        data = JSON.parse(body);
      } catch (e) {
        console.warn(
          '⚠️ PATCH /postulaciones/:id recibió un string que no es JSON. Se ignora el body.',
        );
        data = {};
      }
    }

    if (!data || typeof data !== 'object') {
      data = {};
    }

    return this.postulacionesService.update(id, data);
  }

  // =====================================================
  // PATCH /postulaciones/:id/estado
  //  -> usado desde el frontend para cambiar solo el estado
  // =====================================================
  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de una postulación' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoDto,
  ) {
    return this.postulacionesService.updateEstado(id, updateEstadoDto.estado);
  }
}
