/**
 * Servicio de Postulaciones
 */

import { Postulacion, PostulacionDetalle, PostulacionFormData } from "@/types";
import apiService from "./api.service";

class PostulacionService {
  /**
   * Obtener postulaciones de un postulante
   */
  async getPostulacionesByPostulante(
    postulanteId: number
  ): Promise<Postulacion[]> {
    return apiService.get<Postulacion[]>(
      `/postulaciones/postulante/${postulanteId}`
    );
  }

  /**
   * Obtener postulaciones de un cargo
   */
  async getPostulacionesByCargo(
    cargoId: number
  ): Promise<PostulacionDetalle[]> {
    return apiService.get<PostulacionDetalle[]>(
      `/postulaciones/cargo/${cargoId}`
    );
  }

  /**
   * Obtener todas las postulaciones de una empresa
   */
  async getPostulacionesByEmpresa(
    empresaId: number
  ): Promise<PostulacionDetalle[]> {
    return apiService.get<PostulacionDetalle[]>(
      `/postulaciones/empresa/${empresaId}`
    );
  }

  /**
   * Obtener detalle de una postulación
   */
  async getPostulacionById(id: number): Promise<PostulacionDetalle> {
    return apiService.get<PostulacionDetalle>(`/postulaciones/${id}`);
  }

  /**
   * Crear nueva postulación
   */
  async createPostulacion(
    data: PostulacionFormData
  ): Promise<PostulacionDetalle> {
    const formData = new FormData();

    // El backend espera idCargo
    // El postulanteId se obtiene del token JWT en el backend
    formData.append("idCargo", data.cargoId.toString());

    if (data.cvFile) {
      formData.append("cv", data.cvFile);
    }

    if (data.cvUrl) {
      formData.append("cvUrl", data.cvUrl);
    }

    if (data.respuestasJson) {
      formData.append("respuestasJson", JSON.stringify(data.respuestasJson));
    }

    return apiService.postFormData<PostulacionDetalle>(
      "/postulaciones",
      formData
    );
  }

  /**
   * Actualizar estado de postulación
   */
  async updatePostulacionEstado(
    id: number,
    estado: string
  ): Promise<PostulacionDetalle> {
    return apiService.patch<PostulacionDetalle>(`/postulaciones/${id}`, {
      estado,
    });
  }
}

export const postulacionService = new PostulacionService();
export default postulacionService;
