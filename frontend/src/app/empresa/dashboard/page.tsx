"use client";

import { useState } from "react";
import {
  Building2,
  Briefcase,
  Users,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";

// Importar tipos centralizados
import { PostulacionDetalle } from "@/types";

// Importar hook personalizado
import { useEmpresaDashboard } from "@/hooks/useEmpresaDashboard";

// Importar utilidades
import {
  formatDate,
  formatCurrency,
  getEstadoColor,
  getTipoContratoLabel,
} from "@/lib/formatters";

export default function DashboardEmpresaPage() {
  // Usar hook personalizado para toda la lógica de datos
  const {
    empresa,
    cargos,
    postulaciones,
    loading,
    logout,
    deleteCargo,
    toggleCargoStatus,
    refresh,
  } = useEmpresaDashboard();

  // Estados locales de UI
  const [activeTab, setActiveTab] = useState<
    "cargos" | "postulaciones" | "crear" | "perfil"
  >("cargos");
  const [postulacionesFiltradas, setPostulacionesFiltradas] = useState<PostulacionDetalle[]>([]);

  // Estado para crear cargo
  const [nuevoCargo, setNuevoCargo] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    salario: "",
    tipoContrato: "FULL_TIME",
    modalidad: "PRESENCIAL",
    requisitos: "",
    pregunta1: "",
    pregunta2: "",
    pregunta3: "",
  });

  const handleLogout = () => {
    logout();
  };

  const handleDeleteCargo = async (cargoId: number) => {
    if (confirm("¿Estás seguro de eliminar este cargo?")) {
      const success = await deleteCargo(cargoId);
      if (success) {
        alert("Cargo eliminado correctamente");
      }
    }
  };

  const handleToggleCargo = async (cargoId: number, activo: boolean) => {
    const success = await toggleCargoStatus(cargoId, !activo);
    if (success) {
      alert(`Cargo ${!activo ? "activado" : "desactivado"} correctamente`);
    }
  };

  const fetchPostulacionesByCargo = async (cargoId: number) => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/postulaciones/cargo/${cargoId}`,
        {
          headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Encontrar el cargo en la lista de cargos
        const cargo = cargos.find(c => c.id === cargoId);
        
        // Enriquecer las postulaciones con información del cargo si no viene del backend
        const postulacionesEnriquecidas = data.map((p: any) => ({
          ...p,
          cargo: p.cargo || cargo // Usar cargo del backend si existe, sino usar el de la lista local
        }));
        
        setPostulacionesFiltradas(postulacionesEnriquecidas);
        setActiveTab("postulaciones");
      }
    } catch (error) {
      console.error("Error fetching postulaciones:", error);
    }
  };

  const handleCrearCargo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cargos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: nuevoCargo.titulo,
            descripcion: nuevoCargo.descripcion,
            ubicacion: nuevoCargo.ubicacion,
            salarioEstimado: nuevoCargo.salario
              ? parseFloat(nuevoCargo.salario)
              : undefined,
            tipoContrato: nuevoCargo.tipoContrato,
            modalidad: nuevoCargo.modalidad,
            requisitos: nuevoCargo.requisitos,
            preguntasJson: {
              preguntas: [
                nuevoCargo.pregunta1,
                nuevoCargo.pregunta2,
                nuevoCargo.pregunta3,
              ].filter((p) => p.trim() !== ""),
            },
          }),
        }
      );

      if (response.ok) {
        alert("¡Cargo creado exitosamente!");
        setNuevoCargo({
          titulo: "",
          descripcion: "",
          ubicacion: "",
          salario: "",
          tipoContrato: "FULL_TIME",
          modalidad: "PRESENCIAL",
          requisitos: "",
          pregunta1: "",
          pregunta2: "",
          pregunta3: "",
        });
        setActiveTab("cargos");
        window.location.reload();
      } else {
        alert("Error al crear el cargo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el cargo");
    }
  };

  const handleEliminarCargo = async (cargoId: number) => {
    if (!confirm("¿Estás seguro de eliminar este cargo?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cargos/${cargoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Cargo eliminado");
        window.location.reload();
      } else {
        alert("Error al eliminar el cargo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el cargo");
    }
  };

  const handleCambiarEstadoPostulacion = async (
    postulacionId: number,
    nuevoEstado: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/postulaciones/${postulacionId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        alert(`Postulación ${nuevoEstado.toLowerCase()}`);
        // Recargar todas las postulaciones
        refresh();
      } else {
        alert("Error al actualizar la postulación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la postulación");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const postulacionesPendientes = postulaciones.filter(
    (p) => p.estado === "PENDIENTE"
  ).length;
  const postulacionesAprobadas = postulaciones.filter(
    (p) => p.estado === "SELECCIONADO"
  ).length;
  const cargosActivos = cargos.filter((c) => c.activo).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Portal de Empresa
                </h1>
                <p className="text-sm text-slate-600">{empresa?.nombre}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all shadow-sm"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-1">
                    Cargos Activos
                  </p>
                  <p className="text-4xl font-bold text-orange-900">
                    {cargosActivos}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-700 mb-1">
                    Pendientes
                  </p>
                  <p className="text-4xl font-bold text-yellow-900">
                    {postulacionesPendientes}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    Aprobadas
                  </p>
                  <p className="text-4xl font-bold text-green-900">
                    {postulacionesAprobadas}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">
                    Total Postulaciones
                  </p>
                  <p className="text-4xl font-bold text-blue-900">
                    {postulaciones.length}
                  </p>
                </div>
                <div className="bg-white/70 p-3 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("cargos")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "cargos"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={20} />
                Mis Cargos ({cargos.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("postulaciones")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "postulaciones"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={20} />
                Postulaciones ({postulaciones.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("crear")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "crear"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus size={20} />
                Crear Cargo
              </div>
            </button>
            <button
              onClick={() => setActiveTab("perfil")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "perfil"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 size={20} />
                Mi Perfil
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mis Cargos Tab */}
        {activeTab === "cargos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Mis Cargos ({cargos.length})
              </h2>
              <button
                onClick={() => setActiveTab("crear")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus size={20} />
                Nuevo Cargo
              </button>
            </div>

            <div className="space-y-4">
              {cargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {cargo.titulo}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cargo.activo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cargo.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {cargo.descripcion}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {cargo.ubicacion}
                        </div>
                        {cargo.salarioEstimado && (
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />$
                            {cargo.salarioEstimado.toLocaleString()} CLP
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          {cargo.tipoContrato}
                        </div>
                        <button
                          onClick={() => fetchPostulacionesByCargo(cargo.id)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Ver postulaciones"
                        >
                          <Users size={16} />
                          {cargo._count?.postulaciones || 0} postulaciones
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => fetchPostulacionesByCargo(cargo.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver Postulaciones"
                      >
                        <Users size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteCargo(cargo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cargos.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes cargos publicados
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primer cargo para empezar a recibir postulaciones
                  </p>
                  <button
                    onClick={() => setActiveTab("crear")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Crear Cargo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Postulaciones Tab */}
        {activeTab === "postulaciones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Postulaciones Recibidas ({postulacionesFiltradas.length > 0 ? postulacionesFiltradas.length : postulaciones.length})
              </h2>
              {postulacionesFiltradas.length > 0 && (
                <button
                  onClick={() => setPostulacionesFiltradas([])}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Ver todas las postulaciones
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(postulacionesFiltradas.length > 0 ? postulacionesFiltradas : postulaciones).map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {postulacion.postulante?.nombre || "Postulante"}
                        </h3>
                        {postulacion.puntajeIa && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                            <TrendingUp size={16} className="text-blue-600" />
                            <span className="text-sm font-bold text-blue-600">
                              {postulacion.puntajeIa}% match
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">
                        Cargo:{" "}
                        <span className="font-medium">
                          {postulacion.cargo?.titulo || "No especificado"}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div>{postulacion.postulante?.correo}</div>
                        {postulacion.postulante?.telefono && (
                          <div>{postulacion.postulante.telefono}</div>
                        )}
                        {postulacion.postulante?.experienciaAnios !==
                          undefined && (
                          <div>
                            {postulacion.postulante.experienciaAnios} años de
                            experiencia
                          </div>
                        )}
                      </div>

                      {postulacion.postulante?.linkedinUrl && (
                        <a
                          href={postulacion.postulante.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Ver perfil en LinkedIn →
                        </a>
                      )}
                    </div>

                    <div className="ml-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(postulacion.estado)}`}
                      >
                        {postulacion.estado}
                      </span>
                    </div>
                  </div>

                  {postulacion.estado === "PENDIENTE" && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() =>
                          handleCambiarEstadoPostulacion(
                            postulacion.id,
                            "SELECCIONADO"
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        <CheckCircle size={20} />
                        Aprobar
                      </button>
                      <button
                        onClick={() =>
                          handleCambiarEstadoPostulacion(
                            postulacion.id,
                            "Rechazado"
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        <XCircle size={20} />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {(postulacionesFiltradas.length === 0 && postulaciones.length === 0) && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No hay postulaciones aún
                  </h3>
                  <p className="text-gray-600">
                    Las postulaciones aparecerán aquí cuando los candidatos
                    apliquen a tus cargos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crear Cargo Tab */}
        {activeTab === "crear" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Crear Nuevo Cargo
            </h2>

            <form
              onSubmit={handleCrearCargo}
              className="bg-white rounded-xl shadow-sm border p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoCargo.titulo}
                  onChange={(e) =>
                    setNuevoCargo({ ...nuevoCargo, titulo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Desarrollador Full Stack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  rows={6}
                  required
                  value={nuevoCargo.descripcion}
                  onChange={(e) =>
                    setNuevoCargo({
                      ...nuevoCargo,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe las responsabilidades y requisitos del puesto..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoCargo.ubicacion}
                    onChange={(e) =>
                      setNuevoCargo({
                        ...nuevoCargo,
                        ubicacion: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Santiago, Chile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario (CLP)
                  </label>
                  <input
                    type="number"
                    value={nuevoCargo.salario}
                    onChange={(e) =>
                      setNuevoCargo({
                        ...nuevoCargo,
                        salario: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Contrato *
                  </label>
                  <select
                    required
                    value={nuevoCargo.tipoContrato}
                    onChange={(e) =>
                      setNuevoCargo({
                        ...nuevoCargo,
                        tipoContrato: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="FULL_TIME">Tiempo Completo</option>
                    <option value="PART_TIME">Medio Tiempo</option>
                    <option value="PROJECT">Por Proyecto</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="INTERNSHIP">Práctica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad *
                  </label>
                  <select
                    required
                    value={nuevoCargo.modalidad}
                    onChange={(e) =>
                      setNuevoCargo({
                        ...nuevoCargo,
                        modalidad: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="REMOTO">Remoto</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos
                </label>
                <textarea
                  rows={4}
                  value={nuevoCargo.requisitos}
                  onChange={(e) =>
                    setNuevoCargo({
                      ...nuevoCargo,
                      requisitos: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lista los requisitos principales del puesto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Preguntas para Candidatos (3 preguntas requeridas para
                  análisis IA) *
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Pregunta 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCargo.pregunta1}
                      onChange={(e) =>
                        setNuevoCargo({
                          ...nuevoCargo,
                          pregunta1: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ¿Cuántos años de experiencia tienes con React y Node.js?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Pregunta 2 *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCargo.pregunta2}
                      onChange={(e) =>
                        setNuevoCargo({
                          ...nuevoCargo,
                          pregunta2: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Describe un proyecto complejo que hayas liderado"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Pregunta 3 *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCargo.pregunta3}
                      onChange={(e) =>
                        setNuevoCargo({
                          ...nuevoCargo,
                          pregunta3: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ¿Qué experiencia tienes con PostgreSQL y bases de datos?"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Publicar Cargo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cargos")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === "perfil" && empresa && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Perfil de la Empresa
            </h2>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-blue-600" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {empresa.nombre}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {empresa.descripcion || "Sin descripción"}
                  </p>
                  <p className="text-sm text-gray-600">{empresa.correo}</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  Estadísticas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {cargos.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Cargos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {cargosActivos}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Activos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {postulacionesPendientes}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pendientes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {postulaciones.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
