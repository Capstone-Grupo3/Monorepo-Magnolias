import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly MAX_INTENTOS = 3;
  private readonly VENTANA_TIEMPO_HORAS = 1;

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = this.obtenerIP(request);
    const correo = request.body?.correo;

    if (!correo) {
      return true; // Si no hay correo, dejar pasar (será validado por otros decoradores)
    }

    // Verificar intentos por IP
    const intentosRecientes = await this.contarIntentosRecientes(ip, correo);

    if (intentosRecientes >= this.MAX_INTENTOS) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Demasiados intentos de registro. Por favor, intenta nuevamente en ${this.VENTANA_TIEMPO_HORAS} hora(s).`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private obtenerIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private async contarIntentosRecientes(
    ip: string,
    correo: string,
  ): Promise<number> {
    const tiempoLimite = new Date();
    tiempoLimite.setHours(
      tiempoLimite.getHours() - this.VENTANA_TIEMPO_HORAS,
    );

    const intentosEmpresas = await this.prisma.empresa.count({
      where: {
        correo,
        fechaUltimoIntento: {
          gte: tiempoLimite,
        },
      },
    });

    const intentosPostulantes = await this.prisma.postulante.count({
      where: {
        correo,
        fechaUltimoIntento: {
          gte: tiempoLimite,
        },
      },
    });

    return intentosEmpresas + intentosPostulantes;
  }
}
