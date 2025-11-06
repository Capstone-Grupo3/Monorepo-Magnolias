/**
 * Tipos relacionados con Autenticación
 */

export type UserType = "empresa" | "postulante";

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  userType?: UserType;
}

export interface RegisterEmpresaDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  descripcion?: string;
  rut?: string;
}

export interface RegisterPostulanteDTO {
  rut: string;
  nombre: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  linkedinUrl?: string;
  skillsJson?: any;
  experienciaAnios?: number;
}

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  tipo: UserType;
}
