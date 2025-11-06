/**
 * Servicio de Empresas
 */

import { Empresa } from "@/types";
import apiService from "./api.service";

class EmpresaService {
  /**
   * Obtener perfil de la empresa por ID
   */
  async getEmpresaProfile(id: number): Promise<Empresa> {
    return apiService.get<Empresa>(`/empresas/${id}`);
  }

  /**
   * Actualizar perfil de la empresa
   */
  async updateEmpresa(id: number, data: Partial<Empresa>): Promise<Empresa> {
    return apiService.patch<Empresa>(`/empresas/${id}`, data);
  }

  /**
   * Obtener todas las empresas
   */
  async getEmpresas(): Promise<Empresa[]> {
    return apiService.get<Empresa[]>("/empresas");
  }
}

export const empresaService = new EmpresaService();
export default empresaService;
