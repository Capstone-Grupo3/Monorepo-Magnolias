/**
 * Servicio de Cargos/Vacantes
 */

import { Cargo, CargoDetalle, CreateCargoDTO } from "@/types";
import apiService from "./api.service";

class CargoService {
  /**
   * Obtener todos los cargos activos
   */
  async getCargos(): Promise<Cargo[]> {
    return apiService.get<Cargo[]>("/cargos");
  }

  /**
   * Obtener cargo por ID
   */
  async getCargoById(id: number): Promise<CargoDetalle> {
    return apiService.get<CargoDetalle>(`/cargos/${id}`);
  }

  /**
   * Obtener cargos de una empresa
   */
  async getCargosByEmpresa(empresaId: number): Promise<CargoDetalle[]> {
    return apiService.get<CargoDetalle[]>(`/cargos/empresa/${empresaId}`);
  }

  /**
   * Crear nuevo cargo
   */
  async createCargo(data: CreateCargoDTO): Promise<CargoDetalle> {
    return apiService.post<CargoDetalle>("/cargos", data);
  }

  /**
   * Actualizar cargo
   */
  async updateCargo(
    id: number,
    data: Partial<CreateCargoDTO>
  ): Promise<CargoDetalle> {
    return apiService.patch<CargoDetalle>(`/cargos/${id}`, data);
  }

  /**
   * Eliminar cargo
   */
  async deleteCargo(id: number): Promise<void> {
    return apiService.delete<void>(`/cargos/${id}`);
  }

  /**
   * Activar/Desactivar cargo
   */
  async toggleCargoStatus(
    id: number,
    activo: boolean
  ): Promise<CargoDetalle> {
    return apiService.patch<CargoDetalle>(`/cargos/${id}`, { activo });
  }
}

export const cargoService = new CargoService();
export default cargoService;
