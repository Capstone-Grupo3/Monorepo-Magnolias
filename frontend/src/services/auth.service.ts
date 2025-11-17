/**
 * Servicio de Autenticación
 */

import { LoginCredentials, LoginResponse } from "@/types";
import apiService from "./api.service";

class AuthService {
  /**
   * Login de empresa
   */
  async loginEmpresa(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      "/auth/login/empresa",
      credentials,
      false // No requiere autenticación
    );

    return response;
  }

  /**
   * Login de postulante
   */
  async loginPostulante(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>(
      "/auth/login/postulante",
      credentials,
      false // No requiere autenticación
    );

    return response;
  }

  /**
   * Logout (limpiar datos locales)
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  /**
   * Obtener tipo de usuario actual
   */
  getUserType(): "empresa" | "postulante" | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userType") as "empresa" | "postulante" | null;
    }
    return null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Guardar token y tipo de usuario
   */
  saveAuth(token: string, userType: "empresa" | "postulante"): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
    }
  }

  /**
   * Verificar email de empresa
   */
  async verificarEmailEmpresa(token: string): Promise<{ mensaje: string }> {
    const response = await apiService.get<{ mensaje: string }>(
      `/auth/verify-empresa/${token}`,
      false
    );
    return response;
  }

  /**
   * Verificar email de postulante
   */
  async verificarEmailPostulante(token: string): Promise<{ mensaje: string }> {
    const response = await apiService.get<{ mensaje: string }>(
      `/auth/verify-postulante/${token}`,
      false
    );
    return response;
  }

  /**
   * Reenviar email de verificación para empresa
   */
  async reenviarVerificacionEmpresa(correo: string): Promise<{ mensaje: string }> {
    const response = await apiService.post<{ mensaje: string }>(
      `/auth/resend-verification/empresa/${correo}`,
      {},
      false
    );
    return response;
  }

  /**
   * Reenviar email de verificación para postulante
   */
  async reenviarVerificacionPostulante(correo: string): Promise<{ mensaje: string }> {
    const response = await apiService.post<{ mensaje: string }>(
      `/auth/resend-verification/postulante/${correo}`,
      {},
      false
    );
    return response;
  }

  /**
   * Iniciar autenticación con LinkedIn (empresa)
   */
  async loginLinkedInEmpresa(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${apiUrl}/auth/linkedin/empresa`,
      'linkedin-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      alert('Por favor, permite ventanas emergentes para usar OAuth');
    }
  }

  /**
   * Iniciar autenticación con LinkedIn (postulante)
   */
  async loginLinkedInPostulante(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${apiUrl}/auth/linkedin/postulante`,
      'linkedin-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      alert('Por favor, permite ventanas emergentes para usar OAuth');
    }
  }

  /**
   * Iniciar autenticación con Google (empresa)
   */
  async loginGoogleEmpresa(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${apiUrl}/auth/google/empresa`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      alert('Por favor, permite ventanas emergentes para usar OAuth');
    }
  }

  /**
   * Iniciar autenticación con Google (postulante)
   */
  async loginGooglePostulante(): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${apiUrl}/auth/google/postulante`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      alert('Por favor, permite ventanas emergentes para usar OAuth');
    }
  }

  /**
   * Reenviar email de verificación
   */
  async resendVerificationEmail(email: string, userType: 'empresa' | 'postulante'): Promise<void> {
    await apiService.post(
      `/auth/resend-verification/${userType}/${email}`,
      {},
      false
    );
  }
}

export const authService = new AuthService();
export default authService;

