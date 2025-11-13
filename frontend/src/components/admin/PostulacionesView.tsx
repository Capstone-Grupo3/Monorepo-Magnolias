"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Building2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { adminService, Postulacion } from "@/services/admin.service";

export default function PostulacionesView() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Filtros
  const [estadoFilter, setEstadoFilter] = useState("");

  const loadPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPostulaciones({
        page,
        limit: 50,
        estado: estadoFilter || undefined,
      });

      setPostulaciones(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error al cargar postulaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostulaciones();
  }, [page, estadoFilter]);

  const handleViewDetails = async (id: number) => {
    try {
      const details = await adminService.getPostulacionDetails(id);
      setSelectedPostulacion(details);
      setShowModal(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    }
  };

  const handleExport = () => {
    adminService.exportToCSV(
      postulaciones.map((p) => ({
        ID: p.id,
        Postulante: p.postulante.nombre,
        RUT: p.postulante.rut,
        Correo: p.postulante.correo,
        Cargo: p.cargo.titulo,
        Empresa: p.empresa.nombre,
        Estado: p.estado,
        Puntaje: p.puntajeIa || "N/A",
        Fecha: new Date(p.fechaPostulacion).toLocaleDateString(),
      })),
      `postulaciones_${new Date().toISOString().split("T")[0]}`
    );
  };

  const getEstadoColor = (estado: string) => {
    const colors: { [key: string]: string } = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      EVALUADO: "bg-blue-100 text-blue-800",
      RECHAZADO: "bg-red-100 text-red-800",
      SELECCIONADO: "bg-green-100 text-green-800",
      EN_REVISION: "bg-purple-100 text-purple-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  if (loading && postulaciones.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EVALUADO">Evaluado</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="SELECCIONADO">Seleccionado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{postulaciones.length}</span> de{" "}
          <span className="font-medium">{total}</span> postulaciones
        </p>
      </div>

      {/* Tabla de postulaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Postulante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {postulaciones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron postulaciones
                  </td>
                </tr>
              ) : (
                postulaciones.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {post.postulante.nombre}
                      </div>
                      <div className="text-sm text-gray-500">{post.postulante.correo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.cargo.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.empresa.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.fechaPostulacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(
                          post.estado
                        )}`}
                      >
                        {post.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.puntajeIa ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {post.puntajeIa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(post.id)}
                        className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                Detalles de Postulación
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del postulante */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Postulante
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{selectedPostulacion.postulante.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RUT</p>
                    <p className="font-medium">{selectedPostulacion.postulante.rut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correo</p>
                    <p className="font-medium">{selectedPostulacion.postulante.correo}</p>
                  </div>
                  {selectedPostulacion.postulante.telefono && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{selectedPostulacion.postulante.telefono}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del cargo */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Cargo
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-lg">{selectedPostulacion.cargo.titulo}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedPostulacion.cargo.empresa.nombre}
                  </p>
                </div>
              </div>

              {/* Análisis IA */}
              {selectedPostulacion.puntajeIa && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Análisis IA
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Puntaje</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {Number(selectedPostulacion.puntajeIa).toFixed(2)}
                        </p>
                      </div>
                      {selectedPostulacion.feedbackIa && (
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Feedback</p>
                          <p className="text-sm">{selectedPostulacion.feedbackIa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CV */}
              {selectedPostulacion.cvUrl && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">CV</h4>
                  <a
                    href={selectedPostulacion.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Ver CV
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
