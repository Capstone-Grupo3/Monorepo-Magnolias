import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto } from './dto/login-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginAdmin(loginDto: LoginAdminDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { correo: loginDto.correo },
    });

    if (!admin || !(await bcrypt.compare(loginDto.contrasena, admin.contrasenaHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!admin.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { sub: admin.id, email: admin.correo, tipo: 'admin' };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        nombre: admin.nombre,
        correo: admin.correo,
        tipo: 'admin',
      },
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(createAdminDto.contrasena, 10);

    return this.prisma.admin.create({
      data: {
        nombre: createAdminDto.nombre,
        correo: createAdminDto.correo,
        contrasenaHash: hashedPassword,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        fechaCreacion: true,
        estado: true,
      },
    });
  }

  async findByEmail(correo: string) {
    return this.prisma.admin.findUnique({
      where: { correo },
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const [totalUsuarios, totalPostulaciones, totalEmpresas, totalCargos] = await Promise.all([
      this.prisma.postulante.count({ where: { estado: 'ACTIVO' } }),
      this.prisma.postulacion.count(),
      this.prisma.empresa.count({ where: { estado: 'ACTIVO' } }),
      this.prisma.cargo.count({ where: { estado: 'ACTIVA' } }),
    ]);

    return {
      totalUsuarios,
      totalPostulaciones,
      totalEmpresas,
      totalCargos,
    };
  }

  // Get all users (postulantes + empresas)
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    tipo?: 'postulante' | 'empresa';
    search?: string;
    estado?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const skip = (page - 1) * limit;

    let usuarios = [];
    let total = 0;

    if (!params?.tipo || params.tipo === 'postulante') {
      const wherePostulante: any = {};
      
      if (params?.search) {
        wherePostulante.OR = [
          { nombre: { contains: params.search, mode: 'insensitive' } },
          { correo: { contains: params.search, mode: 'insensitive' } },
          { rut: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.estado) {
        wherePostulante.estado = params.estado;
      }

      const postulantes = await this.prisma.postulante.findMany({
        where: wherePostulante,
        skip,
        take: limit,
        orderBy: { fechaRegistro: 'desc' },
      });

      const totalPostulantes = await this.prisma.postulante.count({ where: wherePostulante });

      usuarios = [
        ...usuarios,
        ...postulantes.map(p => ({
          id: p.id,
          nombre: p.nombre,
          rut: p.rut,
          correo: p.correo,
          telefono: p.telefono,
          tipo: 'postulante',
          fechaRegistro: p.fechaRegistro,
          estado: p.estado,
          verificado: true, // Por ahora todos verificados
        })),
      ];

      total += totalPostulantes;
    }

    if (!params?.tipo || params.tipo === 'empresa') {
      const whereEmpresa: any = {};

      if (params?.search) {
        whereEmpresa.OR = [
          { nombre: { contains: params.search, mode: 'insensitive' } },
          { correo: { contains: params.search, mode: 'insensitive' } },
          { rut: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      if (params?.estado) {
        whereEmpresa.estado = params.estado;
      }

      const empresas = await this.prisma.empresa.findMany({
        where: whereEmpresa,
        skip: params?.tipo === 'empresa' ? skip : 0,
        take: params?.tipo === 'empresa' ? limit : undefined,
        orderBy: { fechaCreacion: 'desc' },
      });

      const totalEmpresas = await this.prisma.empresa.count({ where: whereEmpresa });

      usuarios = [
        ...usuarios,
        ...empresas.map(e => ({
          id: e.id,
          nombre: e.nombre,
          rut: e.rut,
          correo: e.correo,
          tipo: 'empresa',
          fechaRegistro: e.fechaCreacion,
          estado: e.estado,
          verificado: true,
        })),
      ];

      total += totalEmpresas;
    }

    return {
      data: usuarios.slice(0, limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get all postulaciones
  async getAllPostulaciones(params?: {
    page?: number;
    limit?: number;
    empresaId?: number;
    cargoId?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.empresaId) {
      where.cargo = {
        idEmpresa: params.empresaId,
      };
    }

    if (params?.cargoId) {
      where.idCargo = params.cargoId;
    }

    if (params?.estado) {
      where.estado = params.estado;
    }

    if (params?.fechaInicio || params?.fechaFin) {
      where.fechaPostulacion = {};
      if (params.fechaInicio) {
        where.fechaPostulacion.gte = new Date(params.fechaInicio);
      }
      if (params.fechaFin) {
        where.fechaPostulacion.lte = new Date(params.fechaFin);
      }
    }

    const [postulaciones, total] = await Promise.all([
      this.prisma.postulacion.findMany({
        where,
        skip,
        take: limit,
        include: {
          postulante: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              rut: true,
            },
          },
          cargo: {
            select: {
              id: true,
              titulo: true,
              empresa: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: { fechaPostulacion: 'desc' },
      }),
      this.prisma.postulacion.count({ where }),
    ]);

    return {
      data: postulaciones.map(p => ({
        id: p.id,
        postulante: {
          id: p.postulante.id,
          nombre: p.postulante.nombre,
          correo: p.postulante.correo,
          rut: p.postulante.rut,
        },
        cargo: {
          id: p.cargo.id,
          titulo: p.cargo.titulo,
        },
        empresa: {
          id: p.cargo.empresa.id,
          nombre: p.cargo.empresa.nombre,
        },
        estado: p.estado,
        puntajeIa: p.puntajeIa ? Number(p.puntajeIa) : null,
        fechaPostulacion: p.fechaPostulacion,
        cvUrl: p.cvUrl,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get postulacion details
  async getPostulacionDetails(id: number) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id },
      include: {
        postulante: true,
        cargo: {
          include: {
            empresa: true,
          },
        },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return postulacion;
  }

  // Get rankings by cargo
  async getRankingsByCargo(cargoId?: number) {
    const where: any = {
      puntajeIa: { not: null },
    };

    if (cargoId) {
      where.idCargo = cargoId;
    }

    const topPostulaciones = await this.prisma.postulacion.findMany({
      where,
      take: 10,
      include: {
        postulante: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
        cargo: {
          select: {
            id: true,
            titulo: true,
            empresa: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: { puntajeIa: 'desc' },
    });

    return topPostulaciones.map(p => ({
      postulanteId: p.postulante.id,
      nombrePostulante: p.postulante.nombre,
      correo: p.postulante.correo,
      cargo: p.cargo.titulo,
      empresa: p.cargo.empresa.nombre,
      puntaje: Number(p.puntajeIa),
    }));
  }

  // Get postulaciones statistics
  async getPostulacionesStats(periodo: 'mes' | 'semana' = 'mes') {
    const now = new Date();
    const startDate = new Date();

    if (periodo === 'mes') {
      startDate.setMonth(now.getMonth() - 6); // Últimos 6 meses
    } else {
      startDate.setDate(now.getDate() - 42); // Últimas 6 semanas
    }

    const postulaciones = await this.prisma.postulacion.findMany({
      where: {
        fechaPostulacion: {
          gte: startDate,
        },
      },
      select: {
        fechaPostulacion: true,
      },
    });

    // Agrupar por período
    const grouped: { [key: string]: number } = {};

    postulaciones.forEach(p => {
      let key: string;
      if (periodo === 'mes') {
        key = `${p.fechaPostulacion.getFullYear()}-${String(p.fechaPostulacion.getMonth() + 1).padStart(2, '0')}`;
      } else {
        const weekNumber = Math.floor((now.getTime() - p.fechaPostulacion.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `Semana ${6 - weekNumber}`;
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([periodo, cantidad]) => ({
      periodo,
      cantidad,
    }));
  }

  // Get top cargos with most postulaciones
  async getTopCargos(limit: number = 5) {
    const cargos = await this.prisma.cargo.findMany({
      include: {
        _count: {
          select: { postulaciones: true },
        },
        empresa: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        postulaciones: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return cargos.map(c => ({
      id: c.id,
      titulo: c.titulo,
      empresa: c.empresa.nombre,
      totalPostulaciones: c._count.postulaciones,
    }));
  }

  // Get raw data
  async getRawData(entity: 'usuario' | 'postulacion' | 'cargo' | 'empresa', id: number) {
    let data: any;

    switch (entity) {
      case 'usuario':
        data = await this.prisma.postulante.findUnique({ where: { id } });
        break;
      case 'postulacion':
        data = await this.prisma.postulacion.findUnique({
          where: { id },
          include: {
            postulante: true,
            cargo: { include: { empresa: true } },
          },
        });
        break;
      case 'cargo':
        data = await this.prisma.cargo.findUnique({
          where: { id },
          include: {
            empresa: true,
            postulaciones: true,
          },
        });
        break;
      case 'empresa':
        data = await this.prisma.empresa.findUnique({
          where: { id },
          include: {
            cargos: true,
          },
        });
        break;
    }

    if (!data) {
      throw new NotFoundException(`${entity} no encontrado`);
    }

    return data;
  }
}
