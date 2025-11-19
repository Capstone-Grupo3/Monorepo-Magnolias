/**
 * Ejemplo de uso del sistema de reportes
 * Este archivo muestra cómo integrar el sistema de reportes en diferentes partes de la aplicación
 */

import reporteService from "@/services/reporte.service";
import { SolicitudReporteDTO, ReporteRanking } from "@/types";

// ========================================
// EJEMPLO 1: Generar reporte desde un componente
// ========================================

async function ejemploGenerarReporte(cargoId: number) {
  try {
    // Configurar solicitud
    const solicitud: SolicitudReporteDTO = {
      cargoId: cargoId,
      incluirTodos: false, // Solo top 10
      enviarEmail: true,
    };

    // Iniciar generación
    const respuesta = await reporteService.generarReporte(solicitud);

    // Esperar a que esté completo
    const reporteCompleto = await reporteService.esperarReporteCompleto(
      respuesta.reporteId,
      30, // Máximo 30 intentos
      2000 // Cada 2 segundos
    );

    // Descargar PDF
    await reporteService.descargarYAbrirPDF(respuesta.reporteId);

    return reporteCompleto;
  } catch (error) {
    console.error("Error generando reporte:", error);
    throw error;
  }
}

// ========================================
// EJEMPLO 2: Listar reportes de un cargo
// ========================================

async function ejemploListarReportes(cargoId: number) {
  try {
    const reportes = await reporteService.obtenerReportesPorCargo(cargoId);
    
    return reportes;
  } catch (error) {
    console.error("Error listando reportes:", error);
    throw error;
  }
}

// ========================================
// EJEMPLO 3: Obtener reporte específico
// ========================================

async function ejemploObtenerReporte(reporteId: string) {
  try {
    const reporte = await reporteService.obtenerReporte(reporteId);

    return reporte;
  } catch (error) {
    console.error("Error obteniendo reporte:", error);
    throw error;
  }
}

// ========================================
// EJEMPLO 4: Generar reporte completo (todos los candidatos)
// ========================================

async function ejemploReporteCompleto(cargoId: number) {
  const solicitud: SolicitudReporteDTO = {
    cargoId: cargoId,
    incluirTodos: true, // TODOS los candidatos
    enviarEmail: true,
  };

  const respuesta = await reporteService.generarReporte(solicitud);
  const reporte = await reporteService.esperarReporteCompleto(respuesta.reporteId);
  
  console.log(`Reporte completo con ${reporte.ranking.length} candidatos`);
  
  return reporte;
}

// ========================================
// EJEMPLO 5: Manejo de errores
// ========================================

async function ejemploConManejoErrores(cargoId: number) {
  try {
    const solicitud: SolicitudReporteDTO = {
      cargoId: cargoId,
      incluirTodos: false,
      enviarEmail: false, // No enviar email en este ejemplo
    };

    const respuesta = await reporteService.generarReporte(solicitud);
    
    try {
      // Intentar esperar con timeout corto
      const reporte = await reporteService.esperarReporteCompleto(
        respuesta.reporteId,
        10, // Solo 10 intentos
        1000 // Cada 1 segundo
      );
      
      return reporte;
    } catch (timeoutError) {
      console.warn("Timeout esperando reporte, intentando obtener estado...");
      
      // Obtener estado actual aunque no esté completo
      const reporteActual = await reporteService.obtenerReporte(respuesta.reporteId);
      
      if (reporteActual.estado === "ERROR") {
        throw new Error("Error en la generación del reporte");
      }
      
      console.log("Reporte aún en generación, reintentando...");
      // Podríamos reintentar o notificar al usuario
      throw timeoutError;
    }
  } catch (error: any) {
    // Manejo específico de errores
    if (error.message?.includes("Cargo no encontrado")) {
      console.error("El cargo no existe o no tienes permisos");
    } else if (error.message?.includes("debe estar cerrado")) {
      console.error("El cargo debe estar cerrado para generar reporte");
    } else if (error.message?.includes("No hay postulaciones")) {
      console.error("El cargo no tiene postulaciones");
    } else {
      console.error("Error inesperado:", error.message);
    }
    
    throw error;
  }
}

// ========================================
// EJEMPLO 6: Descarga directa de PDF
// ========================================

async function ejemploDescargarPDF(reporteId: string) {
  try {
    console.log("Descargando PDF...");
    await reporteService.descargarYAbrirPDF(reporteId);
    console.log("PDF descargado exitosamente");
  } catch (error) {
    console.error("Error descargando PDF:", error);
    throw error;
  }
}

// ========================================
// EJEMPLO 7: Integración en React Component
// ========================================

/*
import { useState } from "react";
import reporteService from "@/services/reporte.service";

function MiComponente() {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [reporteId, setReporteId] = useState<string | null>(null);

  const handleGenerar = async (cargoId: number) => {
    setGenerando(true);
    setError("");
    
    try {
      const respuesta = await reporteService.generarReporte({
        cargoId,
        incluirTodos: false,
        enviarEmail: true,
      });
      
      setReporteId(respuesta.reporteId);
      
      const reporte = await reporteService.esperarReporteCompleto(respuesta.reporteId);
      
      // Descargar automáticamente
      await reporteService.descargarYAbrirPDF(respuesta.reporteId);
      
      alert("¡Reporte generado exitosamente!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleGenerar(123)}
        disabled={generando}
      >
        {generando ? "Generando..." : "Generar Reporte"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
*/

// ========================================
// EXPORTAR EJEMPLOS
// ========================================

export {
  ejemploGenerarReporte,
  ejemploListarReportes,
  ejemploObtenerReporte,
  ejemploReporteCompleto,
  ejemploConManejoErrores,
  ejemploDescargarPDF,
};
