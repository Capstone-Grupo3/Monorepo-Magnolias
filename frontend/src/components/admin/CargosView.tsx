"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Users,
  Pause,
  Play,
  XCircle,
} from "lucide-react";
import { adminService, Cargo, CreateCargoDto, UpdateCargoDto, EmpresaSimple } from "@/services/admin.service";
import AdminModal, { FormField, ModalFooterButtons } from "./AdminModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/components/shared/Toast";

const MODALIDADES = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTO", label: "Remoto" },
  { value: "HIBRIDO", label: "Híbrido" },
];

const TIPOS_CONTRATO = [
  { value: "FULL_TIME", label: "Tiempo Completo" },
  { value: "PART_TIME", label: "Medio Tiempo" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "PRACTICA", label: "Prácticas" },
];

const ESTADOS = [
  { value: "ACTIVA", label: "Activa", color: "bg-green-100 text-green-800" },
  { value: "CERRADA", label: "Cerrada", color: "bg-red-100 text-red-800" },
  { value: "PAUSADA", label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
];

export default function CargosView() {
  const { success, error } = useToast();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [empresaFilter, setEmpresaFilter] = useState<number | "">("");

  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [form, setForm] = useState<any>({
    idEmpresa: 0,
    titulo: "",
    descripcion: "",
    ubicacion: "",
    modalidad: "PRESENCIAL",
    tipoContrato: "FULL_TIME",
    salarioEstimado: undefined,
    requisitos: "",
  });

  const loadCargos = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCargos({
        page,
        limit: 25,
        estado: estadoFilter || undefined,
        empresaId: empresaFilter || undefined,
        search: search || undefined,
      });

      setCargos(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error al cargar cargos:", err);
      error("Error al cargar cargos");
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await adminService.getEmpresasSimple();
      setEmpresas(response);
    } catch (err) {
      console.error("Error al cargar empresas:", err);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    loadCargos();
  }, [page, estadoFilter, empresaFilter]);

  const handleSearch = () => {
    setPage(1);
    loadCargos();
  };

  const handleExport = () => {
    adminService.exportToCSV(
      cargos.map((c) => ({
        ID: c.id,
        Titulo: c.titulo,
        Empresa: c.empresa.nombre,
        Ubicación: c.ubicacion || "N/A",
        Modalidad: c.modalidad || "N/A",
        "Tipo Contrato": c.tipoContrato || "N/A",
        "Salario Estimado": c.salarioEstimado || "N/A",
        Estado: c.estado,
        Postulaciones: c.totalPostulaciones,
        "Fecha Publicación": new Date(c.fechaPublicacion).toLocaleDateString(),
      })),
      `cargos_${new Date().toISOString().split("T")[0]}`
    );
    success("Archivo exportado exitosamente");
  };

  const handleCreate = () => {
    setSelectedCargo(null);
    setForm({
      idEmpresa: empresas[0]?.id || 0,
      titulo: "",
      descripcion: "",
      ubicacion: "",
      modalidad: "PRESENCIAL",
      tipoContrato: "FULL_TIME",
      salarioEstimado: undefined,
      requisitos: "",
    });
    setCreateModalOpen(true);
  };

  const handleEdit = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setForm({
      titulo: cargo.titulo,
      descripcion: cargo.descripcion || "",
      ubicacion: cargo.ubicacion || "",
      modalidad: cargo.modalidad || "PRESENCIAL",
      tipoContrato: cargo.tipoContrato || "FULL_TIME",
      salarioEstimado: cargo.salarioEstimado || undefined,
      requisitos: cargo.requisitos || "",
      estado: cargo.estado,
    });
    setEditModalOpen(true);
  };

  const handleDelete = (cargo: Cargo) => {
    setSelectedCargo(cargo);
    setDeleteModalOpen(true);
  };

  const handleChangeEstado = async (cargo: Cargo, nuevoEstado: string) => {
    try {
      await adminService.updateCargo(cargo.id, { estado: nuevoEstado as any });
      success(`Cargo ${nuevoEstado === "ACTIVA" ? "activado" : nuevoEstado === "PAUSADA" ? "pausado" : "cerrado"}`);
      loadCargos();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleSaveCreate = async () => {
    try {
      setSaving(true);
      const createDto: CreateCargoDto = {
        idEmpresa: form.idEmpresa,
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion,
        modalidad: form.modalidad,
        tipoContrato: form.tipoContrato,
        salarioEstimado: form.salarioEstimado,
        requisitos: form.requisitos,
      };
      await adminService.createCargo(createDto);
      success("Cargo creado exitosamente");
      setCreateModalOpen(false);
      loadCargos();
    } catch (err: any) {
      error(err.message || "Error al crear cargo");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedCargo) return;

    try {
      setSaving(true);
      const updateDto: UpdateCargoDto = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion,
        modalidad: form.modalidad,
        tipoContrato: form.tipoContrato,
        salarioEstimado: form.salarioEstimado,
        requisitos: form.requisitos,
        estado: form.estado,
      };
      await adminService.updateCargo(selectedCargo.id, updateDto);
      success("Cargo actualizado exitosamente");
      setEditModalOpen(false);
      loadCargos();
    } catch (err: any) {
      error(err.message || "Error al actualizar cargo");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCargo) return;

    try {
      setSaving(true);
      await adminService.deleteCargo(selectedCargo.id);
      success("Cargo eliminado exitosamente");
      setDeleteModalOpen(false);
      loadCargos();
    } catch (err: any) {
      error(err.message || "Error al eliminar cargo");
    } finally {
      setSaving(false);
    }
  };

  const getEstadoStyle = (estado: string) => {
    return ESTADOS.find((e) => e.value === estado)?.color || "bg-gray-100 text-gray-800";
  };

  const getTipoContratoLabel = (tipo: string) => {
    return TIPOS_CONTRATO.find((t) => t.value === tipo)?.label || tipo;
  };

  const getModalidadLabel = (modalidad: string) => {
    return MODALIDADES.find((m) => m.value === modalidad)?.label || modalidad;
  };

  if (loading && cargos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar por título o descripción..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
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
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
            <button
              onClick={loadCargos}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cargos</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-xl font-bold">{cargos.filter((c) => c.estado === "ACTIVA").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Pause className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pausados</p>
              <p className="text-xl font-bold">{cargos.filter((c) => c.estado === "PAUSADA").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cerrados</p>
              <p className="text-xl font-bold">{cargos.filter((c) => c.estado === "CERRADA").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Postulantes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cargos.map((cargo) => (
                <tr key={cargo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cargo.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">{cargo.titulo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{cargo.empresa.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {cargo.ubicacion || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {getModalidadLabel(cargo.modalidad || "")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {getTipoContratoLabel(cargo.tipoContrato || "")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      {cargo.salarioEstimado
                        ? `$${cargo.salarioEstimado.toLocaleString()}`
                        : "No especificado"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={cargo.estado}
                      onChange={(e) => handleChangeEstado(cargo, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoStyle(cargo.estado)}`}
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{cargo.totalPostulaciones}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cargo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cargo)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
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
          <div className="text-sm text-gray-500">
            Mostrando {(page - 1) * 25 + 1} - {Math.min(page * 25, total)} de {total} cargos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear */}
      <AdminModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Crear Nuevo Cargo"
        onSubmit={handleSaveCreate}
        loading={saving}
      >
        <div className="space-y-4">
          <FormField label="Empresa *">
            <select
              value={form.idEmpresa}
              onChange={(e) => setForm({ ...form, idEmpresa: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Seleccionar empresa</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Título *">
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <FormField label="Descripción *">
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ubicación *">
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </FormField>

            <FormField label="Modalidad">
              <select
                value={form.modalidad}
                onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo Contrato">
              <select
                value={form.tipoContrato}
                onChange={(e) => setForm({ ...form, tipoContrato: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {TIPOS_CONTRATO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Salario Estimado">
              <input
                type="number"
                value={form.salarioEstimado || ""}
                onChange={(e) => setForm({ ...form, salarioEstimado: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 1500000"
              />
            </FormField>
          </div>

          <FormField label="Requisitos">
            <textarea
              value={form.requisitos}
              onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Describe los requisitos del cargo..."
            />
          </FormField>
        </div>
      </AdminModal>

      {/* Modal Editar */}
      <AdminModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Cargo"
        onSubmit={handleSaveEdit}
        loading={saving}
      >
        <div className="space-y-4">
          <FormField label="Título *">
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <FormField label="Descripción *">
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ubicación">
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </FormField>

            <FormField label="Modalidad">
              <select
                value={form.modalidad}
                onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo Contrato">
              <select
                value={form.tipoContrato}
                onChange={(e) => setForm({ ...form, tipoContrato: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {TIPOS_CONTRATO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Salario Estimado">
              <input
                type="number"
                value={form.salarioEstimado || ""}
                onChange={(e) => setForm({ ...form, salarioEstimado: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </FormField>
          </div>

          <FormField label="Estado">
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Requisitos">
            <textarea
              value={form.requisitos}
              onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </FormField>
        </div>
      </AdminModal>

      {/* Modal Eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cargo"
        message={`¿Estás seguro de que deseas eliminar el cargo "${selectedCargo?.titulo}"? Esta acción también eliminará todas las postulaciones asociadas.`}
        confirmText="Eliminar"
        type="danger"
        loading={saving}
      />
    </div>
  );
}
