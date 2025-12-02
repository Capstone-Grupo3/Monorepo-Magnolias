/**
 * Servicio de Cargos/Vacantes
 */

import { 
  Cargo, 
  CargoDetalle, 
  CreateCargoDTO, 
  FiltrosCargo, 
  CargosPaginatedResponse 
} from "@/types";
import apiService from "./api.service";

class CargoService {
  /**
   * Construir query string a partir de filtros
   */
  private buildQueryString(filtros: FiltrosCargo): string {
    const params = new URLSearchParams();

    // Solo agregar parámetros que tengan valor
    if (filtros.busqueda?.trim()) {
      params.append("busqueda", filtros.busqueda.trim());
    }
    if (filtros.ubicacion?.trim()) {
      params.append("ubicacion", filtros.ubicacion.trim());
    }
    if (filtros.tipoContrato) {
      params.append("tipoContrato", filtros.tipoContrato);
    }
    if (filtros.modalidad) {
      params.append("modalidad", filtros.modalidad);
    }
    if (filtros.estado) {
      params.append("estado", filtros.estado);
    }
    if (filtros.empresa?.trim()) {
      params.append("empresa", filtros.empresa.trim());
    }
    if (filtros.empresaId) {
      params.append("empresaId", filtros.empresaId.toString());
    }
    if (filtros.salarioMin !== null && filtros.salarioMin !== undefined) {
      params.append("salarioMin", filtros.salarioMin.toString());
    }
    if (filtros.salarioMax !== null && filtros.salarioMax !== undefined) {
      params.append("salarioMax", filtros.salarioMax.toString());
    }
    if (filtros.page && filtros.page > 0) {
      params.append("page", filtros.page.toString());
    }
    if (filtros.limit && filtros.limit > 0) {
      params.append("limit", filtros.limit.toString());
    }
    if (filtros.sortBy) {
      params.append("sortBy", filtros.sortBy);
    }
    if (filtros.sortOrder) {
      params.append("sortOrder", filtros.sortOrder);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Obtener cargos con filtros y paginación
   */
  async getCargosWithFilters(filtros: FiltrosCargo = {}): Promise<CargosPaginatedResponse> {
    const queryString = this.buildQueryString(filtros);
    return apiService.get<CargosPaginatedResponse>(`/cargos${queryString}`);
  }

  /**
   * Obtener todos los cargos activos (sin paginación, para compatibilidad)
   * @deprecated Usar getCargosWithFilters para mejor rendimiento
   */
  async getCargos(): Promise<Cargo[]> {
    const response = await this.getCargosWithFilters({ limit: 1000 });
    return response.data;
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
