import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { RutValidator } from '../../common/validators/rut.validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto, ip?: string) {
    // Validar RUT
    const rutLimpio = RutValidator.limpiar(createEmpresaDto.rut);

    // Verificar RUT duplicado
    const rutExistente = await this.prisma.empresa.findUnique({
      where: { rut: rutLimpio },
    });

    if (rutExistente) {
      throw new ConflictException('El RUT ya está registrado');
    }

    // Verificar correo duplicado
    const correoExistente = await this.prisma.empresa.findUnique({
      where: { correo: createEmpresaDto.correo },
    });

    if (correoExistente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Verificar LinkedIn/Google ID duplicado si se proporciona
    if (createEmpresaDto.linkedinId) {
      const linkedinExistente = await this.prisma.empresa.findUnique({
        where: { linkedinId: createEmpresaDto.linkedinId },
      });

      if (linkedinExistente) {
        throw new ConflictException('Esta cuenta de LinkedIn ya está registrada');
      }
    }

    if (createEmpresaDto.googleId) {
      const googleExistente = await this.prisma.empresa.findUnique({
        where: { googleId: createEmpresaDto.googleId },
      });

      if (googleExistente) {
        throw new ConflictException('Esta cuenta de Google ya está registrada');
      }
    }

    // Hash de contraseña solo si se proporciona
    let hashedPassword = null;
    if (createEmpresaDto.contrasena) {
      hashedPassword = await bcrypt.hash(createEmpresaDto.contrasena, 10);
    }

    const empresa = await this.prisma.empresa.create({
      data: {
        rut: rutLimpio,
        nombre: createEmpresaDto.nombre,
        correo: createEmpresaDto.correo,
        contrasenaHash: hashedPassword,
        descripcion: createEmpresaDto.descripcion,
        logoUrl: createEmpresaDto.logoUrl,
        linkedinId: createEmpresaDto.linkedinId,
        googleId: createEmpresaDto.googleId,
        ultimoIntentoIp: ip,
        fechaUltimoIntento: new Date(),
        intentosRegistro: 1,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasenaHash, tokenVerificacion, ...result } = empresa;
    return result;
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return empresa;
  }

  async findByEmail(correo: string) {
    return this.prisma.empresa.findUnique({
      where: { correo },
    });
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    await this.findOne(id);

    const data: any = { ...updateEmpresaDto };

    if (updateEmpresaDto.contrasena) {
      data.contrasenaHash = await bcrypt.hash(updateEmpresaDto.contrasena, 10);
      delete data.contrasena;
    }

    const empresa = await this.prisma.empresa.update({
      where: { id },
      data,
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        descripcion: true,
        logoUrl: true,
        fechaCreacion: true,
        estado: true,
      },
    });

    return empresa;
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.empresa.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}
