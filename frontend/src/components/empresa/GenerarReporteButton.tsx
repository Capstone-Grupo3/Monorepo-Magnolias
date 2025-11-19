"use client";

import { useState } from "react";
import { FileText, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import reporteService from "@/services/reporte.service";
import { SolicitudReporteDTO, RespuestaGeneracionReporte } from "@/types";

interface GenerarReporteButtonProps {
  cargoId: number;
  cargoTitulo: string;
  estadoCargo: string;
  onReporteGenerado?: () => void;
}

export default function GenerarReporteButton({
  cargoId,
  cargoTitulo,
  estadoCargo,
  onReporteGenerado,
}: GenerarReporteButtonProps) {
  const [generando, setGenerando] = useState(false);
  const [reporteId, setReporteId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const puedeGenerarReporte = estadoCargo === "CERRADA" || estadoCargo === "EN_PROCESO";

  const handleGenerarReporte = async (incluirTodos: boolean = false) => {
    if (!puedeGenerarReporte) {
      setError("El cargo debe estar cerrado o en proceso para generar el reporte");
      return;
    }

    setGenerando(true);
    setError("");
    setMensaje("Generando reporte...");
    setMostrarOpciones(false);

    try {
      const solicitud: SolicitudReporteDTO = {
        cargoId,
        incluirTodos,
        enviarEmail: true,
      };

      const respuesta: RespuestaGeneracionReporte =
        await reporteService.generarReporte(solicitud);

      // Validar que reporteId existe en la respuesta
      if (!respuesta.reporteId) {
        throw new Error("No se recibió el ID del reporte del servidor");
      }

      setReporteId(respuesta.reporteId);
      setMensaje(
        `Reporte en generación... (ID: ${respuesta.reporteId.substring(0, 8)}...)`
      );

      // Esperar a que el reporte esté completo
      const reporteCompleto = await reporteService.esperarReporteCompleto(
        respuesta.reporteId
      );

      setMensaje("¡Reporte generado exitosamente!");
      
      // Descargar automáticamente
      await reporteService.descargarYAbrirPDF(respuesta.reporteId);

      // Reporte generado y descargado

      if (onReporteGenerado) {
        onReporteGenerado();
      }

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMensaje("");
        setReporteId(null);
      }, 5000);
    } catch (err: any) {
      console.error("=== ERROR EN GENERACIÓN DE REPORTE ===");
      console.error("Error completo:", err);
      console.error("Mensaje:", err.message);
      console.error("Stack:", err.stack);
      
      setError(err.message || "Error al generar el reporte");
      setMensaje("");
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarReporte = async () => {
    if (!reporteId) return;

    try {
      await reporteService.descargarYAbrirPDF(reporteId);
    } catch (err: any) {
      console.error("Error descargando PDF:", err);
      setError("Error al descargar el PDF");
    }
  };

  if (!puedeGenerarReporte) {
    return (
      <div className="bg-gray-100 px-4 py-3 rounded-lg text-sm text-gray-500">
        <FileText className="inline-block w-4 h-4 mr-2" />
        El reporte estará disponible cuando el cargo esté cerrado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Botón principal */}
      <div className="flex gap-2">
        <button
          onClick={() => handleGenerarReporte(false)}
          disabled={generando}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            font-semibold text-white transition-all duration-200
            ${
              generando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
            }
          `}
        >
          {generando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando reporte...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generar Reporte Final
            </>
          )}
        </button>

        {/* Botón de opciones */}
        {!generando && (
          <button
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
            className="px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg
                     hover:bg-purple-50 transition-colors font-semibold"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Opciones avanzadas */}
      {mostrarOpciones && !generando && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-purple-900 text-sm">
            Opciones de generación
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => handleGenerarReporte(false)}
              className="w-full text-left px-4 py-2 bg-white rounded-lg border border-purple-200
                       hover:bg-purple-100 transition-colors text-sm"
            >
              <div className="font-medium text-purple-900">Top 10 candidatos</div>
              <div className="text-xs text-gray-600">
                Reporte con los 10 mejores candidatos
              </div>
            </button>
            <button
              onClick={() => handleGenerarReporte(true)}
              className="w-full text-left px-4 py-2 bg-white rounded-lg border border-purple-200
                       hover:bg-purple-100 transition-colors text-sm"
            >
              <div className="font-medium text-purple-900">
                Todos los candidatos
              </div>
              <div className="text-xs text-gray-600">
                Reporte completo con todos los postulantes
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {mensaje && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
          {generando ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <span className="text-sm font-medium text-blue-900">{mensaje}</span>
          {reporteId && !generando && (
            <button
              onClick={handleDescargarReporte}
              className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-600 text-white
                       rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
          )}
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-900">{error}</span>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>ℹ️ Información:</strong> El reporte incluye ranking completo,
          análisis de top 3 candidatos, comparativa, estadísticas y
          recomendaciones de IA. Se enviará automáticamente a tu correo.
        </p>
      </div>
    </div>
  );
}
