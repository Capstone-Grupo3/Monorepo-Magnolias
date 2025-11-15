import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostulanteDto } from './dto/create-postulante.dto';
import { UpdatePostulanteDto } from './dto/update-postulante.dto';
import { RutValidator } from '../../common/validators/rut.validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PostulantesService {
  constructor(private prisma: PrismaService) {}

  async create(createPostulanteDto: CreatePostulanteDto, ip?: string) {
    // Validar RUT
    const rutLimpio = RutValidator.limpiar(createPostulanteDto.rut);

    // Verificar RUT duplicado
    const rutExistente = await this.prisma.postulante.findUnique({
      where: { rut: rutLimpio },
    });

    if (rutExistente) {
      throw new ConflictException('El RUT ya está registrado');
    }

    // Verificar correo duplicado
    const correoExistente = await this.prisma.postulante.findUnique({
      where: { correo: createPostulanteDto.correo },
    });

    if (correoExistente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Verificar LinkedIn/Google ID duplicado si se proporciona
    if (createPostulanteDto.linkedinId) {
      const linkedinExistente = await this.prisma.postulante.findUnique({
        where: { linkedinId: createPostulanteDto.linkedinId },
      });

      if (linkedinExistente) {
        throw new ConflictException('Esta cuenta de LinkedIn ya está registrada');
      }
    }

    if (createPostulanteDto.googleId) {
      const googleExistente = await this.prisma.postulante.findUnique({
        where: { googleId: createPostulanteDto.googleId },
      });

      if (googleExistente) {
        throw new ConflictException('Esta cuenta de Google ya está registrada');
      }
    }

    // Hash de contraseña solo si se proporciona
    let hashedPassword = null;
    if (createPostulanteDto.contrasena) {
      hashedPassword = await bcrypt.hash(createPostulanteDto.contrasena, 10);
    }

    const postulante = await this.prisma.postulante.create({
      data: {
        rut: rutLimpio,
        nombre: createPostulanteDto.nombre,
        correo: createPostulanteDto.correo,
        contrasenaHash: hashedPassword,
        telefono: createPostulanteDto.telefono,
        linkedinUrl: createPostulanteDto.linkedinUrl,
        skillsJson: createPostulanteDto.skillsJson,
        experienciaAnios: createPostulanteDto.experienciaAnios,
        linkedinId: createPostulanteDto.linkedinId,
        googleId: createPostulanteDto.googleId,
        conexionesLinkedin: createPostulanteDto.conexionesLinkedin,
        ultimoIntentoIp: ip,
        fechaUltimoIntento: new Date(),
        intentosRegistro: 1,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasenaHash, tokenVerificacion, ...result } = postulante;
    return result;
  }

  async findAll() {
    return this.prisma.postulante.findMany({
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        telefono: true,
        cvUrl: true,
        linkedinUrl: true,
        skillsJson: true,
        experienciaAnios: true,
        fechaRegistro: true,
        estado: true,
      },
    });
  }

  async findOne(id: number) {
    const postulante = await this.prisma.postulante.findUnique({
      where: { id },
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        telefono: true,
        cvUrl: true,
        linkedinUrl: true,
        skillsJson: true,
        experienciaAnios: true,
        fechaRegistro: true,
        estado: true,
      },
    });

    if (!postulante) {
      throw new NotFoundException('Postulante no encontrado');
    }

    return postulante;
  }

  async findByEmail(correo: string) {
    return this.prisma.postulante.findUnique({
      where: { correo },
    });
  }

  async update(id: number, updatePostulanteDto: UpdatePostulanteDto) {
    await this.findOne(id);

    const data: any = { ...updatePostulanteDto };

    if (updatePostulanteDto.contrasena) {
      data.contrasenaHash = await bcrypt.hash(
        updatePostulanteDto.contrasena,
        10,
      );
      delete data.contrasena;
    }

    const postulante = await this.prisma.postulante.update({
      where: { id },
      data,
      select: {
        id: true,
        rut: true,
        nombre: true,
        correo: true,
        telefono: true,
        cvUrl: true,
        linkedinUrl: true,
        skillsJson: true,
        experienciaAnios: true,
        fechaRegistro: true,
        estado: true,
      },
    });

    return postulante;
  }

  async updateCvUrl(id: number, cvUrl: string) {
    return this.prisma.postulante.update({
      where: { id },
      data: { cvUrl },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.postulante.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });
  }
}
