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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CargoService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { UpdateCargoIaDto } from './dto/update-cargo-ia.dto';
import { FilterCargoDto } from './dto/filter-cargo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cargos')
@Controller('cargos')
export class CargoController {
  constructor(private readonly cargosService: CargoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva cargo' })
  @ApiResponse({ status: 201, description: 'cargo creada exitosamente' })
  create(@Body() createCargoDto: CreateCargoDto, @Request() req) {
    return this.cargosService.create(createCargoDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener cargos con filtros y paginación',
    description: 'Busca cargos aplicando filtros opcionales. Soporta búsqueda por texto, ubicación, modalidad, tipo de contrato, empresa y rango salarial. Incluye paginación.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cargos paginada con metadatos',
    schema: {
      properties: {
        data: { type: 'array', description: 'Lista de cargos' },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total de registros' },
            page: { type: 'number', description: 'Página actual' },
            limit: { type: 'number', description: 'Elementos por página' },
            totalPages: { type: 'number', description: 'Total de páginas' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          }
        }
      }
    }
  })
  findAll(@Query() filterDto: FilterCargoDto) {
    return this.cargosService.findAllWithFilters(filterDto);
  }

  @Get('empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cargos de una empresa' })
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.cargosService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cargo por ID' })
  @ApiResponse({ status: 200, description: 'cargo encontrada' })
  @ApiResponse({ status: 404, description: 'cargo no encontrada' })
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una cargo' })
  update(
    @Param('id') id: string,
    @Body() updateCargoDto: UpdateCargoDto,
    @Request() req,
  ) {
    return this.cargosService.update(+id, updateCargoDto, req.user.userId);
  }

  @Patch(':id/ia')
  @ApiOperation({
    summary: 'Endpoint para recibir resultados IA (n8n callback)',
  })
  // Nota: considerar proteger con token si lo necesitas
  updateIa(@Param('id') id: string, @Body() payload: UpdateCargoIaDto) {
    return this.cargosService.updateIa(+id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar una cargo' })
  remove(@Param('id') id: string, @Request() req) {
    return this.cargosService.remove(+id, req.user.userId);
  }
}
