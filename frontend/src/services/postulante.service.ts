/**
 * Servicio de Postulantes
 */

import { Postulante } from "@/types";
import apiService from "./api.service";

class PostulanteService {
  /**
   * Obtener perfil del Postulante por ID
   */
  async getPostulanteProfile(id: number): Promise<Postulante> {
    return apiService.get<Postulante>(`/Postulantes/${id}`);
  }

  /**
   * Actualizar perfil del Postulante
   */
  async updatePostulante(
    id: number,
    data: Partial<Postulante>
  ): Promise<Postulante> {
    return apiService.patch<Postulante>(`/Postulantes/${id}`, data);
  }

  /**
   * Obtener todos los Postulantes (solo para empresas)
   */
  async getPostulantes(): Promise<Postulante[]> {
    return apiService.get<Postulante[]>("/Postulantes");
  }
}

export const postulanteService = new PostulanteService();
export default postulanteService;
