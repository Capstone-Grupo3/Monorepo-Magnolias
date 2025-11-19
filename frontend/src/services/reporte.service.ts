/**
 * Servicio de Reportes
 */

import {
  ReporteRanking,
  SolicitudReporteDTO,
  RespuestaGeneracionReporte,
} from "@/types";
import apiService from "./api.service";

class ReporteService {
  /**
   * Generar reporte de ranking para un cargo
   */
  async generarReporte(
    data: SolicitudReporteDTO
  ): Promise<RespuestaGeneracionReporte> {
    const respuesta = await apiService.post<any>(
      "/reportes/generar",
      data
    );
    // El backend devuelve { statusCode, message, data: { reporteId, mensaje, estado } }
    return respuesta.data;
  }

  /**
   * Obtener reporte por ID
   */
  async obtenerReporte(reporteId: string): Promise<ReporteRanking> {
    const respuesta = await apiService.get<any>(`/reportes/${reporteId}`);
    // El backend devuelve { statusCode, data: ReporteRanking }
    return respuesta.data;
  }

  /**
   * Obtener todos los reportes de un cargo
   */
  async obtenerReportesPorCargo(cargoId: number): Promise<ReporteRanking[]> {
    const respuesta = await apiService.get<any>(`/reportes/cargo/${cargoId}`);
    // El backend devuelve { statusCode, data: ReporteRanking[] }
    return respuesta.data;
  }

  /**
   * Descargar PDF del reporte
   */
  async descargarPDF(reporteId: string): Promise<Blob> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/reportes/${reporteId}/descargar`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error al descargar PDF:", errorText);
      throw new Error(`Error al descargar PDF: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    
    return blob;
  }

  /**
   * Descargar PDF y abrir en nueva pestaña
   */
  async descargarYAbrirPDF(reporteId: string): Promise<void> {
    const blob = await this.descargarPDF(reporteId);
    
    if (blob.size === 0) {
      throw new Error("El PDF descargado está vacío");
    }
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${reporteId.substring(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar después de un pequeño delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  }

  /**
   * Polling para verificar estado del reporte
   */
  async esperarReporteCompleto(
    reporteId: string,
    maxIntentos: number = 30,
    intervalo: number = 2000
  ): Promise<ReporteRanking> {
    for (let i = 0; i < maxIntentos; i++) {
      const reporte = await this.obtenerReporte(reporteId);

      if (reporte.estado === "COMPLETADO") {
        return reporte;
      }

      if (reporte.estado === "ERROR") {
        throw new Error("Error generando el reporte");
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, intervalo));
    }

    throw new Error("Timeout esperando generación del reporte");
  }
}

export const reporteService = new ReporteService();
export default reporteService;
