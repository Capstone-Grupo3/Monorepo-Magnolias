/**
 * Cliente API Base
 * Maneja todas las peticiones HTTP con autenticación, manejo de errores y logs
 */

import { ApiError } from "@/types";
import { ENV_CONFIG } from "@/config/env.config";

const API_BASE_URL = ENV_CONFIG.API_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    // Eliminar barra final si existe para evitar URLs con doble barra
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  /**
   * Obtiene los headers por defecto con autenticación
   */
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Maneja errores de la API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error desconocido",
        statusCode: response.status,
      }));

      const apiError: ApiError = {
        message: errorData.message || `Error ${response.status}`,
        statusCode: response.status,
        error: errorData.error,
      };

      // Si es 401, limpiar token y redirigir a login
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        window.location.href = "/login";
      }

      throw apiError;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ GET Error:", endpoint, error);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ POST Error:", endpoint, error);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ PATCH Error:", endpoint, error);
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ PUT Error:", endpoint, error);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ DELETE Error:", endpoint, error);
      throw error;
    }
  }

  /**
   * POST con FormData (para archivos)
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    includeAuth = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {};

      if (includeAuth) {
        const token = this.getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error("❌ POST FormData Error:", endpoint, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();
export default apiService;
