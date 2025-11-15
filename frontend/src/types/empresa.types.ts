/**
 * Tipos relacionados con Empresas
 */

export interface Empresa {
  id: number;
  nombre: string;
  correo: string;
  descripcion?: string;
  logoUrl?: string;
  emailVerificado?: boolean;
  linkedinId?: string;
  googleId?: string;
}

export interface EmpresaDetalle extends Empresa {
  // Campos adicionales para vista detallada
  rut?: string;
  direccion?: string;
  telefono?: string;
  sitioWeb?: string;
  tokenVerificacion?: string;
  tokenExpiracion?: Date;
  conexionesLinkedin?: number;
  intentosRegistro?: number;
  ultimoIntentoIp?: string;
  fechaUltimoIntento?: Date;
}
