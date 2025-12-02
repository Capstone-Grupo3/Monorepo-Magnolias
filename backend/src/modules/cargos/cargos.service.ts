import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { UpdateCargoIaDto } from './dto/update-cargo-ia.dto';
import { FilterCargoDto } from './dto/filter-cargo.dto';
import { Prisma } from '@prisma/client';

// Interfaz para respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class CargoService {
  private readonly logger = new Logger(CargoService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async create(createCargoDto: CreateCargoDto, empresaId: number) {
    const cargo = await this.prisma.cargo.create({
      data: {
        ...createCargoDto,
        idEmpresa: empresaId,
        estadoIA: 'GENERANDO',
      },
      include: {
        empresa: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            logoUrl: true,
          },
        },
      },
    });

    this.triggerN8nWorkflow(cargo.id).catch((err) =>
      this.logger.error(`Error disparando n8n para cargo ${cargo.id}`, err),
    );

    return cargo;
  }

  private async triggerN8nWorkflow(cargoId: number): Promise<void> {
    const webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL_CARGO');

    if (!webhookUrl) {
      this.logger.warn(
        'N8N_WEBHOOK_URL_CARGO no configurada, omitiendo trigger n8n',
      );
      return;
    }

    try {
      this.logger.log(`Llamando a n8n ${webhookUrl} para cargo ${cargoId}`);
      this.httpService.post(webhookUrl, { cargoId }).toPromise();
    } catch (error) {
      this.logger.error('Error al llamar n8n', error);
    }
  }

  async findAll(estado?: string) {
    const where = estado ? { estado: estado as any } : {};

    return this.prisma.cargo.findMany({
      where,
      include: {
        empresa: {
          select: { id: true, rut: true, nombre: true, logoUrl: true },
        },
      },
      orderBy: { fechaPublicacion: 'desc' },
    });
  }

  /**
   * Buscar cargos con filtros avanzados y paginación
   */
  async findAllWithFilters(filterDto: FilterCargoDto): Promise<PaginatedResponse<any>> {
    const {
      busqueda,
      ubicacion,
      tipoContrato,
      modalidad,
      estado,
      empresaId,
      empresa,
      salarioMin,
      salarioMax,
      page = 1,
      limit = 10,
      sortBy = 'fechaPublicacion',
      sortOrder = 'desc',
    } = filterDto;

    // Construir condiciones de filtrado
    const where: Prisma.CargoWhereInput = {};

    // Filtro de búsqueda por texto (título, descripción, empresa)
    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } },
        { empresa: { nombre: { contains: busqueda, mode: 'insensitive' } } },
      ];
    }

    // Filtro por ubicación
    if (ubicacion) {
      where.ubicacion = { contains: ubicacion, mode: 'insensitive' };
    }

    // Filtro por tipo de contrato
    if (tipoContrato) {
      where.tipoContrato = tipoContrato;
    }

    // Filtro por modalidad
    if (modalidad) {
      where.modalidad = modalidad;
    }

    // Filtro por estado
    if (estado) {
      where.estado = estado;
    }

    // Filtro por ID de empresa
    if (empresaId) {
      where.idEmpresa = empresaId;
    }

    // Filtro por nombre de empresa
    if (empresa) {
      where.empresa = {
        nombre: { contains: empresa, mode: 'insensitive' },
      };
    }

    // Filtro por rango salarial
    if (salarioMin !== undefined || salarioMax !== undefined) {
      where.salarioEstimado = {};
      if (salarioMin !== undefined) {
        where.salarioEstimado.gte = salarioMin;
      }
      if (salarioMax !== undefined) {
        where.salarioEstimado.lte = salarioMax;
      }
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Validar campo de ordenamiento para prevenir inyección
    const allowedSortFields = [
      'fechaPublicacion',
      'titulo',
      'salarioEstimado',
      'ubicacion',
      'createdAt',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'fechaPublicacion';

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [data, total] = await Promise.all([
      this.prisma.cargo.findMany({
        where,
        include: {
          empresa: {
            select: { id: true, rut: true, nombre: true, logoUrl: true },
          },
        },
        orderBy: { [safeSortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.cargo.count({ where }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByEmpresa(empresaId: number) {
    return this.prisma.cargo.findMany({
      where: { idEmpresa: empresaId },
      include: { _count: { select: { postulaciones: true } } },
      orderBy: { fechaPublicacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            descripcion: true,
            logoUrl: true,
          },
        },
        _count: { select: { postulaciones: true } },
      },
    });

    if (!cargo) throw new NotFoundException('Cargo no encontrado');
    return cargo;
  }

  async update(id: number, updateCargoDto: UpdateCargoDto, empresaId: number) {
    const cargo = await this.findOne(id);
    if (cargo.idEmpresa !== empresaId)
      throw new ForbiddenException('No tienes permisos');

    return this.prisma.cargo.update({
      where: { id },
      data: updateCargoDto,
      include: {
        empresa: {
          select: { id: true, rut: true, nombre: true, logoUrl: true },
        },
      },
    });
  }

  async updateIa(id: number, updateCargoIaDto: UpdateCargoIaDto) {
    await this.findOne(id);

    return this.prisma.cargo.update({
      where: { id },
      data: {
        cvIdeal: updateCargoIaDto.cvIdeal || null,
        preguntasJson: updateCargoIaDto.preguntasJson || null,
        estadoIA: updateCargoIaDto.estadoIA || 'PENDIENTE',
      },
      include: {
        empresa: {
          select: { id: true, rut: true, nombre: true, logoUrl: true },
        },
      },
    });
  }

  async remove(id: number, empresaId: number) {
    const cargo = await this.findOne(id);
    if (cargo.idEmpresa !== empresaId)
      throw new ForbiddenException(
        'No tienes permisos para eliminar este cargo',
      );

    return this.prisma.cargo.update({
      where: { id },
      data: { estado: 'CERRADA' },
    });
  }
}
