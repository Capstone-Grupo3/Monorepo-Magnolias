import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationService {
  /**
   * Genera un token de verificación único
   */
  generarToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Calcula la fecha de expiración (24 horas desde ahora)
   */
  calcularExpiracion(): Date {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + 24);
    return ahora;
  }

  /**
   * Verifica si un token ha expirado
   */
  tokenExpirado(fechaExpiracion: Date): boolean {
    return new Date() > fechaExpiracion;
  }

  /**
   * Valida el número mínimo de conexiones de LinkedIn (anti-bot)
   */
  validarConexionesLinkedin(conexiones: number): boolean {
    const minConexiones = 10; // Mínimo de conexiones para considerarse cuenta real
    return conexiones >= minConexiones;
  }
}
