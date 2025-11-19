/**
 * Servicio de API para funcionalidades de Administrador
 */

import { apiService } from "./api.service";

export interface AdminLoginDto {
  correo: string;
  contrasena: string;
}

export interface AdminUser {
  id: number;
  nombre: string;
  correo: string;
  tipo: string;
  rut?: string;
  telefono?: string;
  fechaRegistro: Date;
  estado: string;
  verificado: boolean;
}

export interface Postulacion {
  id: number;
  postulante: {
    id: number;
    nombre: string;
    correo: string;
    rut: string;
  };
  cargo: {
    id: number;
    titulo: string;
  };
  empresa: {
    id: number;
    nombre: string;
  };
  estado: string;
  puntajeIa: number | null;
  fechaPostulacion: Date;
  cvUrl: string | null;
}

export interface DashboardStats {
  totalUsuarios: number;
  totalPostulaciones: number;
  totalEmpresas: number;
  totalCargos: number;
}

export interface RankingItem {
  postulanteId: number;
  nombrePostulante: string;
  correo: string;
  cargo: string;
  empresa: string;
  puntaje: number;
}

export interface PostulacionStats {
  periodo: string;
  cantidad: number;
}

export interface TopCargo {
  id: number;
  titulo: string;
  empresa: string;
  totalPostulaciones: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

class AdminService {
  /**
   * Login de administrador
   */
  async login(loginDto: AdminLoginDto) {
    return apiService.post<{
      access_token: string;
      user: {
        id: number;
        nombre: string;
        correo: string;
        tipo: string;
      };
    }>("/admin/login", loginDto);
  }

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>("/admin/dashboard/stats");
  }

  /**
   * Obtener todos los usuarios (postulantes + empresas)
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    tipo?: "postulante" | "empresa";
    search?: string;
    estado?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.tipo) queryParams.append("tipo", params.tipo);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.estado) queryParams.append("estado", params.estado);

    const url = `/admin/users${queryParams.toString() ? `?${queryParams}` : ""}`;
    return apiService.get<PaginatedResponse<AdminUser>>(url);
  }

  /**
   * Obtener todas las postulaciones
   */
  async getAllPostulaciones(params?: {
    page?: number;
    limit?: number;
    empresaId?: number;
    cargoId?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<PaginatedResponse<Postulacion>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.empresaId) queryParams.append("empresaId", params.empresaId.toString());
    if (params?.cargoId) queryParams.append("cargoId", params.cargoId.toString());
    if (params?.estado) queryParams.append("estado", params.estado);
    if (params?.fechaInicio) queryParams.append("fechaInicio", params.fechaInicio);
    if (params?.fechaFin) queryParams.append("fechaFin", params.fechaFin);

    const url = `/admin/postulaciones${queryParams.toString() ? `?${queryParams}` : ""}`;
    return apiService.get<PaginatedResponse<Postulacion>>(url);
  }

  /**
   * Obtener detalles de una postulación
   */
  async getPostulacionDetails(id: number): Promise<any> {
    return apiService.get<any>(`/admin/postulaciones/${id}`);
  }

  /**
   * Obtener rankings de candidatos
   */
  async getRankings(cargoId?: number): Promise<RankingItem[]> {
    const url = cargoId 
      ? `/admin/rankings?cargoId=${cargoId}`
      : "/admin/rankings";
    return apiService.get<RankingItem[]>(url);
  }

  /**
   * Obtener estadísticas de postulaciones por período
   */
  async getPostulacionesStats(periodo: "mes" | "semana" = "mes"): Promise<PostulacionStats[]> {
    return apiService.get<PostulacionStats[]>(`/admin/stats/postulaciones?periodo=${periodo}`);
  }

  /**
   * Obtener top cargos con más postulaciones
   */
  async getTopCargos(limit: number = 5): Promise<TopCargo[]> {
    return apiService.get<TopCargo[]>(`/admin/stats/top-cargos?limit=${limit}`);
  }

  /**
   * Obtener datos en crudo de una entidad
   */
  async getRawData(
    entity: "usuario" | "postulacion" | "cargo" | "empresa",
    id: number
  ): Promise<any> {
    return apiService.get<any>(`/admin/raw/${entity}/${id}`);
  }

  /**
   * Exportar datos a CSV
   */
  exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
      console.error("No hay datos para exportar");
      return;
    }

    // Obtener las claves del primer objeto
    const headers = Object.keys(data[0]);
    
    // Crear el contenido CSV
    let csv = headers.join(",") + "\n";
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar comas y comillas
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(",") + "\n";
    });

    // Crear y descargar el archivo
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const adminService = new AdminService();
