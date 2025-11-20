import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { firstValueFrom } from 'rxjs';
import { IaService } from '../ia/ia.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PostulacionesService {

  constructor(
    private prisma: PrismaService,
    private iaService: IaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    
  }

  async create(
    createPostulacionDto: CreatePostulacionDto,
    candidatoId: number,
    cvFile?: Express.Multer.File,
  ) {
    // Verificar si ya existe postulación
    const existente = await this.prisma.postulacion.findUnique({
      where: {
        idPostulante_idCargo: {
          idPostulante: candidatoId,
          idCargo: createPostulacionDto.idCargo,
        },
      },
    });

    if (existente) {
      throw new ConflictException('Ya has postulado a este cargo');
    }

    // Subir CV si se proporciona
    let cvUrl: string | null = null;
    
    if (cvFile) {
      try {
        cvUrl = await this.storageService.uploadCV(cvFile, candidatoId);
      } catch (error) {
        console.error('❌ Error al subir CV:', error.message);
        // Continuar sin CV si falla la subida
      }
    }

    // Si no hay CV adjunto, usar el del DTO
    if (!cvUrl && createPostulacionDto.cvUrl) {
      cvUrl = createPostulacionDto.cvUrl;
    }

    // Si aún no hay CV, intentar obtener del perfil
    if (!cvUrl) {
      const postulante = await this.prisma.postulante.findUnique({
        where: { id: candidatoId },
        select: { cvUrl: true },
      });
      cvUrl = postulante?.cvUrl || null;
    }

    // Crear postulación
    const postulacion = await this.prisma.postulacion.create({
      data: {
        idPostulante: candidatoId,
        idCargo: createPostulacionDto.idCargo,
        respuestasJson: createPostulacionDto.respuestasJson,
        cvUrl: cvUrl, // Guardar URL del CV en la postulación
      },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            cvUrl: true,
            skillsJson: true,
            experienciaAnios: true,
          },
        },
        cargo: {
          select: {
            id: true,
            titulo: true,
            requisitos: true,
            preguntasJson: true,
          },
        },
      },
    });

    // ========================================
    // 🚀 TRIGGER WORKFLOW DE N8N
    // ========================================
    this.triggerAnalisisN8n(postulacion.id, postulacion.idCargo).catch((err) => {
      console.error('❌ Error al triggear workflow de n8n:', err.message);
      // Por ahora NO hacemos fallback automático.
      // La postulación se queda en estado PENDIENTE si algo falla.
    });

    return postulacion;
  }

  /**
   * 🚀 NUEVO: Trigger del workflow de n8n para análisis avanzado
   * Este método llama al webhook de n8n que ejecuta el workflow completo:
   * - Obtiene datos de postulación, cargo y postulante
   * - Descarga y analiza el CV con OpenAI
   * - Compara respuestas del formulario con el CV (detección de discrepancias)
   * - Calcula scores de compatibilidad y veracidad
   * - Actualiza la postulación con feedback detallado
   */
  private async triggerAnalisisN8n(postulacionId: number, idCargo: number): Promise<void> {
    try {
      // Llamar al webhook de n8n con el ID de la postulación y del cargo
      await firstValueFrom(
        this.httpService.post(
          process.env.N8N_WEBHOOK_URL,
          { postulacionId, idCargo },
          {
            timeout: 30000, // 30 segundos timeout
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

    } catch (error) {
      console.error(
        `❌ Error al llamar webhook de n8n para postulación ${postulacionId}:`,
        error.message,
      );
      throw error;
    }
  }


  async findByPostulante(postulanteId: number) {
    return this.prisma.postulacion.findMany({
      where: { idPostulante: postulanteId },
      include: {
        cargo: {
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
        },
      },
      orderBy: {
        fechaPostulacion: 'desc',
      },
    });
  }

  async findByCargo(cargoId: number) {
    return this.prisma.postulacion.findMany({
      where: { idCargo: cargoId },
      include: {
        postulante: {
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
          },
        },
      },
      orderBy: [{ puntajeIa: 'desc' }, { fechaPostulacion: 'desc' }],
    });
  }

  async findByEmpresa(empresaId: number) {
    return this.prisma.postulacion.findMany({
      where: {
        cargo: {
          idEmpresa: empresaId,
        },
      },
      include: {
        postulante: {
          select: {
            id: true,
            rut: true,
            nombre: true,
            correo: true,
            telefono: true,
            linkedinUrl: true,
            experienciaAnios: true,
          },
        },
        cargo: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
      orderBy: [{ puntajeIa: 'desc' }, { fechaPostulacion: 'desc' }],
    });
  }

  async findOne(id: number) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id },
      include: {
        postulante: {
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
          },
        },
        cargo: {
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
        },
      },
    });

    if (!postulacion) {
      throw new NotFoundException('Postulación no encontrada');
    }

    return postulacion;
  }

  async updateEstado(id: number, estado: string) {
    // Verificar que existe la postulación
    await this.findOne(id);

    return this.prisma.postulacion.update({
      where: { id },
      data: { estado: estado as any },
    });
  }

  async update(id: number, data: any) {
    try {
      // Verificar que existe la postulación
      await this.findOne(id);

      // Preparar datos con conversión de tipos correcta
      const updateData: any = {};

      // Convertir puntajeIa a número si viene como string
      if (data.puntajeIa !== undefined && data.puntajeIa !== null) {
        updateData.puntajeIa = Number(data.puntajeIa);
      }

      // feedbackIa como string
      if (data.feedbackIa !== undefined && data.feedbackIa !== null) {
        updateData.feedbackIa = String(data.feedbackIa);
      }

      // estado validado contra el enum
      if (data.estado !== undefined && data.estado !== null) {
        const validEstados = ['PENDIENTE', 'EN_REVISION', 'EVALUADO', 'RECHAZADO', 'SELECCIONADO'];
        if (validEstados.includes(data.estado)) {
          updateData.estado = data.estado;
        }
      }

      // Otros campos dinámicos
      if (data.respuestasJson !== undefined) {
        updateData.respuestasJson = data.respuestasJson;
      }

      const resultado = await this.prisma.postulacion.update({
        where: { id },
        data: updateData,
      });

      return resultado;
    } catch (error) {
      console.error(`❌ Error al actualizar postulación ${id}:`, error);
      throw error;
    }
  }
}
