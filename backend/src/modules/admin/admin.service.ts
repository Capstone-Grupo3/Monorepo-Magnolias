import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto } from './dto/login-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdatePostulanteDto, UpdateEmpresaDto } from './dto/update-user.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import { UpdateCargoDto, CreateCargoAdminDto } from './dto/update-cargo.dto';

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

  // Dashboard Statistics - Optimizado para reducir conexiones
  async getDashboardStats() {
    try {
      // Ejecutar consultas en secuencia para no saturar el pool
      const totalUsuarios = await this.prisma.postulante.count({ where: { estado: 'ACTIVO' } });
      const totalPostulaciones = await this.prisma.postulacion.count();
      const totalEmpresas = await this.prisma.empresa.count({ where: { estado: 'ACTIVO' } });
      const totalCargos = await this.prisma.cargo.count({ where: { estado: 'ACTIVA' } });

      return {
        totalUsuarios,
        totalPostulaciones,
        totalEmpresas,
        totalCargos,
      };
    } catch (error: any) {
      // En caso de error de conexión, devolver valores por defecto
      if (error.code === 'P1001' || error.code === 'P2024') {
        console.error('Database connection error in getDashboardStats:', error.message);
        return {
          totalUsuarios: 0,
          totalPostulaciones: 0,
          totalEmpresas: 0,
          totalCargos: 0,
        };
      }
      throw error;
    }
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

    try {
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
    } catch (error: any) {
      console.error('Database connection error in getAllUsers:', error.message);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return { data: [], total: 0, page, totalPages: 0 };
      }
      throw error;
    }
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

    let postulaciones;
    let total;
    
    try {
      // Consultas secuenciales para evitar agotamiento del pool
      postulaciones = await this.prisma.postulacion.findMany({
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
      });
      total = await this.prisma.postulacion.count({ where });
    } catch (error) {
      console.error('Error en getAllPostulaciones:', error);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return { data: [], total: 0, page, totalPages: 0 };
      }
      throw error;
    }

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

  // Get rankings by cargo - Optimizado con manejo de errores
  async getRankingsByCargo(cargoId?: number) {
    try {
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
    } catch (error: any) {
      if (error.code === 'P1001' || error.code === 'P2024') {
        console.error('Database connection error in getRankingsByCargo:', error.message);
        return [];
      }
      throw error;
    }
  }

  // Get postulaciones statistics
  async getPostulacionesStats(periodo: 'mes' | 'semana' = 'mes') {
    try {
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
    } catch (error: any) {
      console.error('Database connection error in getPostulacionesStats:', error.message);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return [];
      }
      throw error;
    }
  }

  // Get top cargos with most postulaciones
  async getTopCargos(limit: number = 5) {
    try {
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
        take: limit,
      });

      // Ordenar manualmente por cantidad de postulaciones
      const sortedCargos = cargos.sort((a, b) => b._count.postulaciones - a._count.postulaciones);

      return sortedCargos.map(c => ({
        id: c.id,
        titulo: c.titulo,
        empresa: c.empresa.nombre,
        totalPostulaciones: c._count.postulaciones,
      }));
    } catch (error: any) {
      console.error('Database connection error in getTopCargos:', error.message);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return [];
      }
      throw error;
    }
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

  // ==================== CRUD USUARIOS ====================

  // Actualizar postulante
  async updatePostulante(id: number, updateDto: UpdatePostulanteDto) {
    const postulante = await this.prisma.postulante.findUnique({ where: { id } });
    
    if (!postulante) {
      throw new NotFoundException('Postulante no encontrado');
    }

    // Verificar si el correo ya existe
    if (updateDto.correo && updateDto.correo !== postulante.correo) {
      const existingEmail = await this.prisma.postulante.findUnique({
        where: { correo: updateDto.correo },
      });
      if (existingEmail) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    // Verificar si el RUT ya existe
    if (updateDto.rut && updateDto.rut !== postulante.rut) {
      const existingRut = await this.prisma.postulante.findUnique({
        where: { rut: updateDto.rut },
      });
      if (existingRut) {
        throw new BadRequestException('El RUT ya está registrado');
      }
    }

    return this.prisma.postulante.update({
      where: { id },
      data: updateDto,
    });
  }

  // Eliminar postulante
  async deletePostulante(id: number) {
    const postulante = await this.prisma.postulante.findUnique({ where: { id } });
    
    if (!postulante) {
      throw new NotFoundException('Postulante no encontrado');
    }

    // Eliminar postulaciones relacionadas primero
    await this.prisma.postulacion.deleteMany({
      where: { idPostulante: id },
    });

    return this.prisma.postulante.delete({ where: { id } });
  }

  // Actualizar empresa
  async updateEmpresa(id: number, updateDto: UpdateEmpresaDto) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Verificar si el correo ya existe
    if (updateDto.correo && updateDto.correo !== empresa.correo) {
      const existingEmail = await this.prisma.empresa.findUnique({
        where: { correo: updateDto.correo },
      });
      if (existingEmail) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    // Verificar si el RUT ya existe
    if (updateDto.rut && updateDto.rut !== empresa.rut) {
      const existingRut = await this.prisma.empresa.findUnique({
        where: { rut: updateDto.rut },
      });
      if (existingRut) {
        throw new BadRequestException('El RUT ya está registrado');
      }
    }

    return this.prisma.empresa.update({
      where: { id },
      data: updateDto,
    });
  }

  // Eliminar empresa (soft delete - cambiar a inactivo)
  async deleteEmpresa(id: number, hardDelete: boolean = false) {
    const empresa = await this.prisma.empresa.findUnique({ where: { id } });
    
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    if (hardDelete) {
      // Eliminar cargos y postulaciones relacionadas
      const cargos = await this.prisma.cargo.findMany({ where: { idEmpresa: id } });
      const cargoIds = cargos.map(c => c.id);
      
      await this.prisma.postulacion.deleteMany({
        where: { idCargo: { in: cargoIds } },
      });
      await this.prisma.cargo.deleteMany({ where: { idEmpresa: id } });
      return this.prisma.empresa.delete({ where: { id } });
    } else {
      return this.prisma.empresa.update({
        where: { id },
        data: { estado: 'INACTIVO' },
      });
    }
  }

  // ==================== CRUD POSTULACIONES ====================

  // Actualizar postulación
  async updatePostulacion(id: number, updateDto: UpdatePostulacionDto) {
    const postulacion = await this.prisma.postulacion.findUnique({ where: { id } });
    
    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return this.prisma.postulacion.update({
      where: { id },
      data: {
        ...(updateDto.estado && { estado: updateDto.estado }),
        ...(updateDto.puntajeIa !== undefined && { puntajeIa: updateDto.puntajeIa }),
      },
      include: {
        postulante: { select: { id: true, nombre: true, correo: true } },
        cargo: { select: { id: true, titulo: true, empresa: { select: { nombre: true } } } },
      },
    });
  }

  // Eliminar postulación
  async deletePostulacion(id: number) {
    const postulacion = await this.prisma.postulacion.findUnique({ where: { id } });
    
    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return this.prisma.postulacion.delete({ where: { id } });
  }

  // ==================== CRUD CARGOS ====================

  // Obtener todos los cargos con paginación
  async getAllCargos(params?: {
    page?: number;
    limit?: number;
    empresaId?: number;
    estado?: string;
    search?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.empresaId) {
      where.idEmpresa = params.empresaId;
    }

    if (params?.estado) {
      where.estado = params.estado;
    }

    if (params?.search) {
      where.OR = [
        { titulo: { contains: params.search, mode: 'insensitive' } },
        { descripcion: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    let cargos;
    let total;
    
    try {
      // Consultas secuenciales para evitar agotamiento del pool
      cargos = await this.prisma.cargo.findMany({
        where,
        skip,
        take: limit,
        include: {
          empresa: { select: { id: true, nombre: true } },
          _count: { select: { postulaciones: true } },
        },
        orderBy: { fechaPublicacion: 'desc' },
      });
      total = await this.prisma.cargo.count({ where });
    } catch (error) {
      console.error('Error en getAllCargos:', error);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return { data: [], total: 0, page, totalPages: 0 };
      }
      throw error;
    }

    return {
      data: cargos.map(c => ({
        id: c.id,
        titulo: c.titulo,
        descripcion: c.descripcion,
        ubicacion: c.ubicacion,
        modalidad: c.modalidad,
        tipoContrato: c.tipoContrato,
        salarioEstimado: c.salarioEstimado ? Number(c.salarioEstimado) : null,
        requisitos: c.requisitos,
        estado: c.estado,
        fechaPublicacion: c.fechaPublicacion,
        fechaCierre: c.fechaCierre,
        empresa: c.empresa,
        totalPostulaciones: c._count.postulaciones,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Crear cargo (como admin)
  async createCargo(createDto: CreateCargoAdminDto) {
    const empresa = await this.prisma.empresa.findUnique({ 
      where: { id: createDto.idEmpresa } 
    });
    
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return this.prisma.cargo.create({
      data: {
        idEmpresa: createDto.idEmpresa,
        titulo: createDto.titulo,
        descripcion: createDto.descripcion,
        ubicacion: createDto.ubicacion,
        modalidad: createDto.modalidad as any,
        tipoContrato: createDto.tipoContrato as any,
        salarioEstimado: createDto.salarioEstimado,
        requisitos: createDto.requisitos,
      },
      include: {
        empresa: { select: { id: true, nombre: true } },
      },
    });
  }

  // Actualizar cargo
  async updateCargo(id: number, updateDto: UpdateCargoDto) {
    const cargo = await this.prisma.cargo.findUnique({ where: { id } });
    
    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    // Construir objeto de datos para actualización
    const data: any = {};
    if (updateDto.titulo !== undefined) data.titulo = updateDto.titulo;
    if (updateDto.descripcion !== undefined) data.descripcion = updateDto.descripcion;
    if (updateDto.ubicacion !== undefined) data.ubicacion = updateDto.ubicacion;
    if (updateDto.modalidad !== undefined) data.modalidad = updateDto.modalidad;
    if (updateDto.tipoContrato !== undefined) data.tipoContrato = updateDto.tipoContrato;
    if (updateDto.salarioEstimado !== undefined) data.salarioEstimado = updateDto.salarioEstimado;
    if (updateDto.requisitos !== undefined) data.requisitos = updateDto.requisitos;
    if (updateDto.estado !== undefined) data.estado = updateDto.estado;

    return this.prisma.cargo.update({
      where: { id },
      data,
      include: {
        empresa: { select: { id: true, nombre: true } },
      },
    });
  }

  // Eliminar cargo
  async deleteCargo(id: number) {
    const cargo = await this.prisma.cargo.findUnique({ where: { id } });
    
    if (!cargo) {
      throw new NotFoundException('Cargo no encontrado');
    }

    // Eliminar postulaciones relacionadas
    await this.prisma.postulacion.deleteMany({
      where: { idCargo: id },
    });

    return this.prisma.cargo.delete({ where: { id } });
  }

  // ==================== CRUD EMPRESAS ====================

  // Obtener todas las empresas con paginación
  async getAllEmpresas(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    search?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.estado) {
      where.estado = params.estado;
    }

    if (params?.search) {
      where.OR = [
        { nombre: { contains: params.search, mode: 'insensitive' } },
        { correo: { contains: params.search, mode: 'insensitive' } },
        { rut: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    let empresas;
    let total;
    
    try {
      // Consultas secuenciales para evitar agotamiento del pool
      empresas = await this.prisma.empresa.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { cargos: true } },
        },
        orderBy: { fechaCreacion: 'desc' },
      });
      total = await this.prisma.empresa.count({ where });
    } catch (error) {
      console.error('Error en getAllEmpresas:', error);
      if (error.code === 'P1001' || error.code === 'P2024') {
        return { data: [], total: 0, page, totalPages: 0 };
      }
      throw error;
    }

    return {
      data: empresas.map(e => ({
        id: e.id,
        nombre: e.nombre,
        rut: e.rut,
        correo: e.correo,
        descripcion: e.descripcion,
        logoUrl: e.logoUrl,
        linkedinUrl: e.linkedinUrl,
        estado: e.estado,
        fechaCreacion: e.fechaCreacion,
        totalCargos: e._count.cargos,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Obtener lista simple de empresas para selects
  async getEmpresasSimple() {
    return this.prisma.empresa.findMany({
      where: { estado: 'ACTIVO' },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
