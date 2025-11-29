"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  Building2,
  Briefcase,
  Mail,
  CheckCircle,
  XCircle,
  Linkedin,
} from "lucide-react";
import { adminService, Empresa, UpdateEmpresaDto } from "@/services/admin.service";
import AdminModal, { FormField, ModalFooterButtons } from "./AdminModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/components/shared/Toast";

export default function EmpresasView() {
  const { success, error } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  // Modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [form, setForm] = useState<UpdateEmpresaDto>({});

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllEmpresas({
        page,
        limit: 25,
        estado: estadoFilter || undefined,
        search: search || undefined,
      });

      setEmpresas(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error al cargar empresas:", err);
      error("Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, [page, estadoFilter]);

  const handleSearch = () => {
    setPage(1);
    loadEmpresas();
  };

  const handleExport = () => {
    adminService.exportToCSV(
      empresas.map((e) => ({
        ID: e.id,
        Nombre: e.nombre,
        RUT: e.rut || "N/A",
        Correo: e.correo,
        LinkedIn: e.linkedinUrl || "N/A",
        Estado: e.estado,
        "Total Cargos": e.totalCargos,
        "Fecha Creación": new Date(e.fechaCreacion).toLocaleDateString(),
      })),
      `empresas_${new Date().toISOString().split("T")[0]}`
    );
    success("Archivo exportado exitosamente");
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setForm({
      nombre: empresa.nombre,
      correo: empresa.correo,
      rut: empresa.rut || "",
      descripcion: empresa.descripcion || "",
      linkedinUrl: empresa.linkedinUrl || "",
      estado: empresa.estado as "ACTIVO" | "INACTIVO",
    });
    setEditModalOpen(true);
  };

  const handleDelete = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDeleteModalOpen(true);
  };

  const handleToggleEstado = async (empresa: Empresa) => {
    try {
      const nuevoEstado = empresa.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
      await adminService.updateEmpresa(empresa.id, { estado: nuevoEstado });
      success(
        `Empresa ${nuevoEstado === "ACTIVO" ? "activada" : "desactivada"} exitosamente`
      );
      loadEmpresas();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedEmpresa) return;

    try {
      setSaving(true);
      await adminService.updateEmpresa(selectedEmpresa.id, form);
      success("Empresa actualizada exitosamente");
      setEditModalOpen(false);
      loadEmpresas();
    } catch (err: any) {
      error(err.message || "Error al actualizar empresa");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmpresa) return;

    try {
      setSaving(true);
      await adminService.deleteEmpresa(selectedEmpresa.id, false);
      success("Empresa desactivada exitosamente");
      setDeleteModalOpen(false);
      loadEmpresas();
    } catch (err: any) {
      error(err.message || "Error al eliminar empresa");
    } finally {
      setSaving(false);
    }
  };

  if (loading && empresas.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nombre, correo o RUT..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={loadEmpresas}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Empresas</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activas</p>
              <p className="text-xl font-bold">{empresas.filter((e) => e.estado === "ACTIVO").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactivas</p>
              <p className="text-xl font-bold">{empresas.filter((e) => e.estado === "INACTIVO").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">RUT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">LinkedIn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cargos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50 dark:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{empresa.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {empresa.logoUrl ? (
                        <img 
                          src={empresa.logoUrl} 
                          alt={empresa.nombre} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{empresa.nombre}</p>
                        {empresa.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{empresa.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {empresa.rut || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <Mail className="w-3 h-3" />
                      {empresa.correo}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {empresa.linkedinUrl ? (
                      <a 
                        href={empresa.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <Linkedin className="w-3 h-3" />
                        Ver perfil
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-medium">{empresa.totalCargos}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEstado(empresa)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        empresa.estado === "ACTIVO"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {empresa.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(empresa)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(empresa)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(page - 1) * 25 + 1} - {Math.min(page * 25, total)} de {total} empresas
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="px-3 py-1 text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Editar */}
      <AdminModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Empresa"
        onSubmit={handleSaveEdit}
        loading={saving}
      >
        <div className="space-y-4">
          <FormField label="Nombre *">
            <input
              type="text"
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <FormField label="Correo *">
            <input
              type="email"
              value={form.correo || ""}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <FormField label="RUT">
            <input
              type="text"
              value={form.rut || ""}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="12.345.678-9"
            />
          </FormField>

          <FormField label="Descripción">
            <textarea
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Descripción de la empresa..."
            />
          </FormField>

          <FormField label="LinkedIn URL">
            <input
              type="url"
              value={form.linkedinUrl || ""}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://linkedin.com/company/..."
            />
          </FormField>

          <FormField label="Estado">
            <select
              value={form.estado || "ACTIVO"}
              onChange={(e) => setForm({ ...form, estado: e.target.value as "ACTIVO" | "INACTIVO" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      {/* Modal Eliminar/Desactivar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Empresa"
        message={`¿Estás seguro de que deseas desactivar la empresa "${selectedEmpresa?.nombre}"? Esto no eliminará sus datos, solo la marcará como inactiva.`}
        confirmText="Desactivar"
        type="warning"
        loading={saving}
      />
    </div>
  );
}



