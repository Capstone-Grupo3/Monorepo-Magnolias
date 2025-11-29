"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { adminService, AdminUser, UpdatePostulanteDto, UpdateEmpresaDto } from "@/services/admin.service";
import AdminModal, { FormField, ModalFooterButtons } from "./AdminModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/components/shared/Toast";

export default function UsersView() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<"" | "postulante" | "empresa">("");
  const [estadoFilter, setEstadoFilter] = useState("");

  // Modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario de edición
  const [editForm, setEditForm] = useState<UpdatePostulanteDto | UpdateEmpresaDto>({});

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({
        page,
        limit: 25,
        tipo: tipoFilter || undefined,
        search: search || undefined,
        estado: estadoFilter || undefined,
      });

      setUsers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, tipoFilter, estadoFilter]);

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleExport = () => {
    adminService.exportToCSV(
      users.map(u => ({
        ID: u.id,
        Nombre: u.nombre,
        RUT: u.rut,
        Correo: u.correo,
        Tipo: u.tipo,
        'Fecha Registro': new Date(u.fechaRegistro).toLocaleDateString(),
        Estado: u.estado,
      })),
      `usuarios_${new Date().toISOString().split('T')[0]}`
    );
    success("Archivo exportado exitosamente");
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre,
      correo: user.correo,
      rut: user.rut || "",
      telefono: user.telefono || "",
      estado: user.estado as "ACTIVO" | "INACTIVO",
    });
    setEditModalOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleToggleEstado = async (user: AdminUser) => {
    try {
      const nuevoEstado = user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
      
      if (user.tipo === "postulante") {
        await adminService.updatePostulante(user.id, { estado: nuevoEstado });
      } else {
        await adminService.updateEmpresa(user.id, { estado: nuevoEstado });
      }
      
      success(
        `Usuario ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"} exitosamente`
      );
      loadUsers();
    } catch (err: any) {
      error(err.message || "Error al cambiar estado");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      
      if (selectedUser.tipo === "postulante") {
        await adminService.updatePostulante(selectedUser.id, editForm as UpdatePostulanteDto);
      } else {
        await adminService.updateEmpresa(selectedUser.id, editForm as UpdateEmpresaDto);
      }

      success("Usuario actualizado exitosamente");
      setEditModalOpen(false);
      loadUsers();
    } catch (err: any) {
      error(err.message || "Error al actualizar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      
      if (selectedUser.tipo === "postulante") {
        await adminService.deletePostulante(selectedUser.id);
      } else {
        await adminService.deleteEmpresa(selectedUser.id, false);
      }

      success("Usuario eliminado exitosamente");
      setDeleteModalOpen(false);
      loadUsers();
    } catch (err: any) {
      error(err.message || "Error al eliminar usuario");
    } finally {
      setSaving(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nombre, correo o RUT..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filtro tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Usuario
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value as "" | "postulante" | "empresa");
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="postulante">Postulantes</option>
              <option value="empresa">Empresas</option>
            </select>
          </div>

          {/* Filtro estado */}
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
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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

      {/* Información de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando <span className="font-medium">{users.length}</span> de{" "}
          <span className="font-medium">{total}</span> usuarios
        </p>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RUT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={`${user.tipo}-${user.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.tipo === "empresa" ? (
                          <Building2 className="w-5 h-5 text-purple-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.rut || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.correo}</div>
                      {user.telefono && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.telefono}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.tipo === "empresa"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.fechaRegistro).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.estado === "ACTIVO"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleEstado(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.estado === "ACTIVO"
                              ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          }`}
                          title={user.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                        >
                          {user.estado === "ACTIVO" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
        title={`Editar ${selectedUser?.tipo === "empresa" ? "Empresa" : "Postulante"}`}
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
          <FormField label="Nombre" required>
            <input
              type="text"
              value={editForm.nombre || ""}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Correo electrónico" required>
            <input
              type="email"
              value={editForm.correo || ""}
              onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="RUT">
            <input
              type="text"
              value={editForm.rut || ""}
              onChange={(e) => setEditForm({ ...editForm, rut: e.target.value })}
              placeholder="12.345.678-9"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </FormField>

          {selectedUser?.tipo === "postulante" && (
            <FormField label="Teléfono">
              <input
                type="tel"
                value={(editForm as UpdatePostulanteDto).telefono || ""}
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </FormField>
          )}

          <FormField label="Estado">
            <select
              value={editForm.estado || "ACTIVO"}
              onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as "ACTIVO" | "INACTIVO" })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar a "${selectedUser?.nombre}"? Esta acción no se puede deshacer y eliminará todos los datos asociados.`}
        confirmText="Eliminar"
        type="danger"
        loading={saving}
      />
    </div>
  );
}
