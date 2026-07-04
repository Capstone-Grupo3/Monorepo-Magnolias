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
  { value: "PENDIENTE", label: "Pendiente", color: "warning-soft text-warning", icon: Clock },
  { value: "EVALUADO", label: "Evaluado", color: "primary-soft text-primary", icon: Star },
  { value: "EN_REVISION", label: "En Revisión", color: "primary-soft text-primary", icon: Eye },
  { value: "SELECCIONADO", label: "Seleccionado", color: "success-soft text-success", icon: CheckCircle },
  { value: "RECHAZADO", label: "Rechazado", color: "error-soft text-error", icon: XCircle },
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postulacionToEdit, setPostulacionToEdit] = useState<Postulacion | null>(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<UpdatePostulacionDto>({});

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
    return ESTADOS.find((e) => e.value === estado)?.color || "bg-gray-100 text-gray-800";
  };

  if (loading && postulaciones.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-xl border border-border-subtle p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-lg hover:bg-surface-muted text-secondary transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ESTADOS.map((estado) => {
          const Icon = estado.icon;
          const count = postulaciones.filter((p) => p.estado === estado.value).length;
          return (
            <button
              key={estado.value}
              onClick={() => setEstadoFilter(estadoFilter === estado.value ? "" : estado.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                estadoFilter === estado.value
                  ? "border-primary bg-primary-soft"
                  : "border-border-subtle hover:border-border-default surface-card"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-bold text-primary dark:text-white">{count}</span>
              </div>
              <p className="text-sm text-secondary mt-1">{estado.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          Mostrando <span className="font-semibold">{postulaciones.length}</span> de{" "}
          <span className="font-semibold">{total}</span> postulaciones
        </p>
      </div>

      <div className="surface-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-subtle">
            <thead className="surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Postulante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Puntaje</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {postulaciones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted">
                    No se encontraron postulaciones
                  </td>
                </tr>
              ) : (
                postulaciones.map((post) => (
                  <tr key={post.id} className="hover:bg-surface-muted transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {post.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary dark:text-white">
                        {post.postulante.nombre}
                      </div>
                      <div className="text-sm text-muted">{post.postulante.correo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary dark:text-white">
                      {post.cargo.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {post.empresa.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
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
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full success-soft text-success">
                          {post.puntajeIa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(post.id)}
                          className="p-1.5 text-primary hover:bg-primary-soft rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1.5 text-blue-600 hover:bg-blue-soft rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="p-1.5 text-error hover:bg-error-soft rounded-lg transition-colors"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between surface-card px-6 py-3 rounded-xl border border-border-subtle">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-lg hover:bg-surface-muted text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-sm text-secondary">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-lg hover:bg-surface-muted text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <div className="surface-muted rounded-lg p-4 mb-4">
              <p className="text-sm text-muted">Postulante</p>
              <p className="font-semibold text-primary dark:text-white">{postulacionToEdit.postulante.nombre}</p>
              <p className="text-sm text-secondary">{postulacionToEdit.cargo.titulo} - {postulacionToEdit.empresa.nombre}</p>
            </div>
          )}

          <FormField label="Estado">
            <select
              value={editForm.estado || ""}
              onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
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
              className="w-full px-3 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>
      </AdminModal>

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

      {showModal && selectedPostulacion && (
        <div className="fixed inset-0 surface-overlay/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-postulacion-title"
            className="surface-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <h3 id="modal-postulacion-title" className="text-2xl font-bold text-primary dark:text-white">
                Detalles de Postulación
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-secondary dark:hover:text-gray-300 text-2xl leading-none p-1 hover:bg-surface-muted rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary dark:text-white">
                  <User className="w-5 h-5 text-primary" />
                  Postulante
                </h4>
                <div className="grid grid-cols-2 gap-4 surface-muted p-4 rounded-xl">
                  <div>
                    <p className="text-sm text-muted">Nombre</p>
                    <p className="font-semibold text-primary dark:text-white">{selectedPostulacion.postulante.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">RUT</p>
                    <p className="font-semibold text-primary dark:text-white">{selectedPostulacion.postulante.rut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Correo</p>
                    <p className="font-semibold text-primary dark:text-white">{selectedPostulacion.postulante.correo}</p>
                  </div>
                  {selectedPostulacion.postulante.telefono && (
                    <div>
                      <p className="text-sm text-muted">Teléfono</p>
                      <p className="font-semibold text-primary dark:text-white">{selectedPostulacion.postulante.telefono}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary dark:text-white">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Cargo
                </h4>
                <div className="surface-muted p-4 rounded-xl">
                  <p className="font-semibold text-lg text-primary dark:text-white">{selectedPostulacion.cargo.titulo}</p>
                  <p className="text-sm text-secondary mt-1 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {selectedPostulacion.cargo.empresa.nombre}
                  </p>
                </div>
              </div>

              {selectedPostulacion.puntajeIa && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary dark:text-white">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Análisis IA
                  </h4>
                  <div className="surface-muted p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-muted">Puntaje</p>
                        <p className="text-3xl font-bold text-primary dark:text-white">
                          {Number(selectedPostulacion.puntajeIa).toFixed(2)}
                        </p>
                      </div>
                      {selectedPostulacion.feedbackIa && (
                        <div className="flex-1">
                          <p className="text-sm text-muted mb-1">Feedback</p>
                          <p className="text-sm text-primary dark:text-white">{selectedPostulacion.feedbackIa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPostulacion.cvUrl && (
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-primary dark:text-white">CV</h4>
                  <a
                    href={selectedPostulacion.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-colors"
                  >
                    Ver CV
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border-subtle">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 surface-muted text-primary dark:text-white rounded-xl hover:bg-surface-hover transition-colors"
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