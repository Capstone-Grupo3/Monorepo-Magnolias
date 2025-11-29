"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Building2,
  TrendingUp,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";
import { adminService, Postulacion, UpdatePostulacionDto } from "@/services/admin.service";
import AdminModal, { FormField, ModalFooterButtons } from "./AdminModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/components/shared/Toast";

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "EVALUADO", label: "Evaluado", color: "bg-blue-100 text-blue-800", icon: Star },
  { value: "EN_REVISION", label: "En Revisión", color: "bg-purple-100 text-purple-800", icon: Eye },
  { value: "SELECCIONADO", label: "Seleccionado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "RECHAZADO", label: "Rechazado", color: "bg-red-100 text-red-800", icon: XCircle },
];

export default function PostulacionesView() {
  const { success, error } = useToast();
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Modales CRUD
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postulacionToEdit, setPostulacionToEdit] = useState<Postulacion | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario de edición
  const [editForm, setEditForm] = useState<UpdatePostulacionDto>({});

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
    } catch (err) {
      console.error("Error al cargar postulaciones:", err);
      error("Error al cargar postulaciones");
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
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      error("Error al cargar detalles");
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
    success("Archivo exportado exitosamente");
  };

  const handleEdit = (postulacion: Postulacion) => {
    setPostulacionToEdit(postulacion);
    setEditForm({
      estado: postulacion.estado as any,
      puntajeIa: postulacion.puntajeIa || undefined,
    });
    setEditModalOpen(true);
  };

  const handleDelete = (postulacion: Postulacion) => {
    setPostulacionToEdit(postulacion);
    setDeleteModalOpen(true);
  };

  const handleChangeEstado = async (postulacion: Postulacion, nuevoEstado: string) => {
    try {
      await adminService.updatePostulacion(postulacion.id, { estado: nuevoEstado as any });
      success(`Estado cambiado a ${nuevoEstado.replace("_", " ")}`);
      loadPostulaciones();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleSaveEdit = async () => {
    if (!postulacionToEdit) return;

    try {
      setSaving(true);
      await adminService.updatePostulacion(postulacionToEdit.id, editForm);
      success("Postulación actualizada exitosamente");
      setEditModalOpen(false);
      loadPostulaciones();
    } catch (err: any) {
      error(err.message || "Error al actualizar postulación");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!postulacionToEdit) return;

    try {
      setSaving(true);
      await adminService.deletePostulacion(postulacionToEdit.id);
      success("Postulación eliminada exitosamente");
      setDeleteModalOpen(false);
      loadPostulaciones();
    } catch (err: any) {
      error(err.message || "Error al eliminar postulación");
    } finally {
      setSaving(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    return ESTADOS.find((e) => e.value === estado)?.color || "bg-gray-100 text-gray-800 dark:text-white";
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-4">
            <button
              onClick={loadPostulaciones}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
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

      {/* Resumen por estados */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ESTADOS.map((estado) => {
          const Icon = estado.icon;
          const count = postulaciones.filter((p) => p.estado === estado.value).length;
          return (
            <button
              key={estado.value}
              onClick={() => setEstadoFilter(estadoFilter === estado.value ? "" : estado.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                estadoFilter === estado.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{estado.label}</p>
            </button>
          );
        })}
      </div>

      {/* Información de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{postulaciones.length}</span> de{" "}
          <span className="font-medium">{total}</span> postulaciones
        </p>
      </div>

      {/* Tabla de postulaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Postulante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puntaje
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {postulaciones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron postulaciones
                  </td>
                </tr>
              ) : (
                postulaciones.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.postulante.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{post.postulante.correo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {post.cargo.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.empresa.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.fechaPostulacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={post.estado}
                        onChange={(e) => handleChangeEstado(post, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${getEstadoColor(post.estado)}`}
                      >
                        {ESTADOS.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(post.id)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de edición */}
      <AdminModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Postulación"
        size="md"
        footer={
          <ModalFooterButtons
            onCancel={() => setEditModalOpen(false)}
            onSubmit={handleSaveEdit}
            submitText="Guardar cambios"
            loading={saving}
          />
        }
      >
        <div className="space-y-4">
          {postulacionToEdit && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Postulante</p>
              <p className="font-medium">{postulacionToEdit.postulante.nombre}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{postulacionToEdit.cargo.titulo} - {postulacionToEdit.empresa.nombre}</p>
            </div>
          )}

          <FormField label="Estado">
            <select
              value={editForm.estado || ""}
              onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Puntaje IA (0-100)">
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={editForm.puntajeIa || ""}
              onChange={(e) => setEditForm({ ...editForm, puntajeIa: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>
        </div>
      </AdminModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar postulación"
        message={`¿Estás seguro de que deseas eliminar la postulación de "${postulacionToEdit?.postulante.nombre}" al cargo "${postulacionToEdit?.cargo.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
        loading={saving}
      />

      {/* Modal de detalles */}
      {showModal && selectedPostulacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalles de Postulación
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del postulante */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Postulante
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-medium text-lg">{selectedPostulacion.cargo.titulo}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
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
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300"
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



