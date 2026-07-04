"use client";

import { useState } from "react";
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  TrendingUp,
  Lock,
  Unlock,
} from "lucide-react";

import { PostulacionDetalle } from "@/types";

import { useEmpresaDashboard } from "@/hooks/useEmpresaDashboard";

import { getEstadoColor } from "@/lib/formatters";

import {
  DashboardHeader,
  StatCard,
  LoadingSpinner,
  LogoutButton,
  useToast,
} from "@/components/shared";
import EmailVerificationBanner from "@/components/shared/EmailVerificationBanner";
import GenerarReporteButton from "@/components/empresa/GenerarReporteButton";

export default function DashboardEmpresaPage() {
  const toast = useToast();

  const [emailVerificado, setEmailVerificado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("emailVerificado") === "true";
    }
    return true;
  });
  const [userEmail, setUserEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userEmail") || "";
    }
    return "";
  });

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

  const [activeTab, setActiveTab] = useState<
    "cargos" | "postulaciones" | "crear" | "perfil"
  >("cargos");
  const [postulacionesFiltradas, setPostulacionesFiltradas] = useState<PostulacionDetalle[]>([]);

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
        toast.success("Cargo eliminado", "El cargo ha sido eliminado correctamente.");
      }
    }
  };

  const handleToggleCargo = async (cargoId: number, activo: boolean) => {
    const success = await toggleCargoStatus(cargoId, !activo);
    if (success) {
      toast.success(
        `Cargo ${!activo ? "activado" : "desactivado"}`,
        `El cargo ha sido ${!activo ? "activado" : "desactivado"} correctamente.`
      );
    }
  };

  const handleCerrarCargo = async (cargoId: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === "CERRADA" ? "ACTIVA" : "CERRADA";
    const mensaje =
      nuevoEstado === "CERRADA"
        ? "¿Cerrar este cargo? No se recibirán más postulaciones y podrás generar el reporte final."
        : "¿Reabrir este cargo? Se podrán recibir nuevas postulaciones.";

    if (!confirm(mensaje)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cargos/${cargoId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (response.ok) {
        toast.success(
          `Cargo ${nuevoEstado === "CERRADA" ? "cerrado" : "reabierto"}`,
          nuevoEstado === "CERRADA"
            ? "Ya puedes generar el reporte final de este cargo."
            : "El cargo está activo para recibir postulaciones."
        );
        refresh();
      } else {
        toast.error("Error", "No se pudo cambiar el estado del cargo.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", "No se pudo cambiar el estado del cargo.");
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
        { headers }
      );

      if (response.ok) {
        const data = await response.json();

        const cargo = cargos.find(c => c.id === cargoId);

        const postulacionesEnriquecidas = data.map((p: any) => ({
          ...p,
          cargo: p.cargo || cargo
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
        toast.success("¡Cargo creado!", "El nuevo cargo está listo para recibir postulaciones.");
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
        toast.error("Error", "No se pudo crear el cargo. Revisa los datos e intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", "No se pudo crear el cargo. Intenta nuevamente.");
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
        toast.success("Cargo eliminado", "El cargo ha sido eliminado permanentemente.");
        window.location.reload();
      } else {
        toast.error("Error", "No se pudo eliminar el cargo.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", "No se pudo eliminar el cargo.");
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
        const estadoTexto = nuevoEstado === "SELECCIONADO" ? "seleccionada" : nuevoEstado.toLowerCase();
        toast.success("Estado actualizado", `La postulación ha sido ${estadoTexto}.`);
        refresh();
      } else {
        toast.error("Error", "No se pudo actualizar el estado de la postulación.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", "No se pudo actualizar el estado de la postulación.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const postulacionesPendientes = postulaciones.filter(
    (p) => p.estado === "PENDIENTE"
  ).length;
  const postulacionesAprobadas = postulaciones.filter(
    (p) => p.estado === "SELECCIONADO"
  ).length;
  const cargosActivos = cargos.filter((c) => c.activo).length;

  return (
    <div className="min-h-screen surface-page">
      <DashboardHeader
        icon={Building2}
        title="Portal de Empresa"
        subtitle={empresa?.nombre}
        actions={<LogoutButton onLogout={handleLogout} />}
      />

      {!emailVerificado && userEmail && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EmailVerificationBanner userEmail={userEmail} userType="empresa" />
        </div>
      )}

      <div className="surface-card border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StatCard
              title="Cargos Activos"
              value={cargosActivos}
              icon={Briefcase}
              color="primary"
            />
            <StatCard
              title="Pendientes"
              value={postulacionesPendientes}
              icon={Clock}
              color="warning"
            />
            <StatCard
              title="Aprobadas"
              value={postulacionesAprobadas}
              icon={CheckCircle}
              color="success"
            />
            <StatCard
              title="Total Postulaciones"
              value={postulaciones.length}
              icon={Users}
              color="primary"
            />
          </div>
        </div>
      </div>

      <div className="surface-card border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("cargos")}
              className={`py-4 px-2 border-b-2 font-semibold transition-all ${
                activeTab === "cargos"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary hover:border-border-default"
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
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary hover:border-border-default"
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
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary hover:border-border-default"
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
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary hover:border-border-default"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "cargos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary dark:text-white">
                Mis Cargos ({cargos.length})
              </h2>
              <button
                onClick={() => setActiveTab("crear")}
                className="flex items-center gap-2 px-4 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all"
              >
                <Plus size={20} />
                Nuevo Cargo
              </button>
            </div>

            <div className="space-y-4">
              {cargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="surface-card rounded-xl border border-border-subtle p-6 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-primary dark:text-white">
                          {cargo.titulo}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            cargo.estado === "CERRADA"
                              ? "error-soft text-error"
                              : cargo.estado === "EN_PROCESO"
                                ? "warning-soft text-warning"
                                : "success-soft text-success"
                          }`}
                        >
                          {cargo.estado === "CERRADA" ? (
                            <>
                              <Lock size={12} />
                              Cerrada
                            </>
                          ) : cargo.estado === "EN_PROCESO" ? (
                            <>
                              <Clock size={12} />
                              En Proceso
                            </>
                          ) : (
                            <>
                              <Unlock size={12} />
                              Activa
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-secondary mb-4 line-clamp-2">
                        {cargo.descripcion}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-secondary">
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
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                          title="Ver postulaciones"
                        >
                          <Users size={16} />
                          {cargo._count?.postulaciones || 0} postulaciones
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {(cargo._count?.postulaciones || 0) > 0 && (
                        <button
                          onClick={() => handleCerrarCargo(cargo.id, cargo.estado)}
                          className={`p-2 rounded-lg transition-all ${
                            cargo.estado === "CERRADA"
                              ? "text-success hover:bg-success-soft"
                              : "text-primary hover:bg-primary-soft"
                          }`}
                          aria-label={
                            cargo.estado === "CERRADA"
                              ? "Reabrir cargo"
                              : "Cerrar cargo para generar reporte"
                          }
                          title={
                            cargo.estado === "CERRADA"
                              ? "Reabrir cargo"
                              : "Cerrar cargo para generar reporte"
                          }
                        >
                          {cargo.estado === "CERRADA" ? (
                            <Unlock size={20} />
                          ) : (
                            <Lock size={20} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => fetchPostulacionesByCargo(cargo.id)}
                        className="p-2 text-primary hover:bg-primary-soft rounded-lg transition-all"
                        aria-label="Ver Postulaciones"
                        title="Ver Postulaciones"
                      >
                        <Users size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteCargo(cargo.id)}
                        className="p-2 text-error hover:bg-error-soft rounded-lg transition-all"
                        aria-label="Eliminar cargo"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {(cargo._count?.postulaciones || 0) > 0 && (
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <GenerarReporteButton
                        cargoId={cargo.id}
                        cargoTitulo={cargo.titulo}
                        estadoCargo={cargo.estado}
                        onReporteGenerado={refresh}
                      />
                    </div>
                  )}
                </div>
              ))}

              {cargos.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
                    No tienes cargos publicados
                  </h3>
                  <p className="text-secondary mb-4">
                    Crea tu primer cargo para empezar a recibir postulaciones
                  </p>
                  <button
                    onClick={() => setActiveTab("crear")}
                    className="px-6 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all"
                  >
                    Crear Cargo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "postulaciones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary dark:text-white">
                Postulaciones Recibidas ({postulacionesFiltradas.length > 0 ? postulacionesFiltradas.length : postulaciones.length})
              </h2>
              {postulacionesFiltradas.length > 0 && (
                <button
                  onClick={() => setPostulacionesFiltradas([])}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  Ver todas las postulaciones
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(postulacionesFiltradas.length > 0 ? postulacionesFiltradas : postulaciones).map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="surface-card rounded-xl border border-border-subtle p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-primary dark:text-white">
                          {postulacion.postulante?.nombre || "Postulante"}
                        </h3>
                        {postulacion.puntajeIa && (
                          <div className="flex items-center gap-1 px-3 py-1 primary-soft rounded-full">
                            <TrendingUp size={16} className="text-primary" />
                            <span className="text-sm font-bold text-primary">
                              {postulacion.puntajeIa}% match
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-secondary mb-3">
                        Cargo:{" "}
                        <span className="font-semibold">
                          {postulacion.cargo?.titulo || "No especificado"}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-secondary mb-4">
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
                          className="text-primary hover:underline text-sm"
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
                    <div className="flex gap-3 pt-4 border-t border-border-subtle">
                      <button
                        onClick={() =>
                          handleCambiarEstadoPostulacion(
                            postulacion.id,
                            "SELECCIONADO"
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:opacity-90 transition-all"
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
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:opacity-90 transition-all"
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
                  <Users className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
                    No hay postulaciones aún
                  </h3>
                  <p className="text-secondary">
                    Las postulaciones aparecerán aquí cuando los candidatos
                    apliquen a tus cargos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "crear" && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">
              Crear Nuevo Cargo
            </h2>

            <form
              onSubmit={handleCrearCargo}
              className="surface-card rounded-xl border border-border-subtle p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Título del Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoCargo.titulo}
                  onChange={(e) =>
                    setNuevoCargo({ ...nuevoCargo, titulo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ej: Desarrollador Full Stack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
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
                  className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe las responsabilidades y requisitos del puesto..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
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
                    className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Santiago, Chile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
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
                    className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="1500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
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
                    className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="FULL_TIME">Tiempo Completo</option>
                    <option value="PART_TIME">Medio Tiempo</option>
                    <option value="PROJECT">Por Proyecto</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="PRACTICA">Práctica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
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
                    className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="REMOTO">Remoto</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
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
                  className="w-full px-4 py-3 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Lista los requisitos principales del puesto..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 primary-bg text-white py-3 rounded-lg font-medium hover:primary-bg-hover transition-all"
                >
                  Publicar Cargo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cargos")}
                  className="px-6 py-3 border border-border-default text-secondary rounded-lg font-medium hover:bg-surface-muted transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "perfil" && empresa && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-bold text-primary dark:text-white">
              Perfil de la Empresa
            </h2>

            <div className="surface-card rounded-xl border border-border-subtle p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 primary-soft rounded-xl flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">
                    {empresa.nombre}
                  </h3>
                  <p className="text-secondary mb-4">
                    {empresa.descripcion || "Sin descripción"}
                  </p>
                  <p className="text-sm text-secondary">{empresa.correo}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border-subtle">
                <h4 className="text-lg font-bold text-primary dark:text-white mb-4">
                  Estadísticas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 primary-soft rounded-xl">
                    <div className="text-3xl font-bold text-primary">
                      {cargos.length}
                    </div>
                    <div className="text-sm text-secondary mt-1">Cargos</div>
                  </div>
                  <div className="text-center p-4 success-soft rounded-xl">
                    <div className="text-3xl font-bold text-success">
                      {cargosActivos}
                    </div>
                    <div className="text-sm text-secondary mt-1">Activos</div>
                  </div>
                  <div className="text-center p-4 warning-soft rounded-xl">
                    <div className="text-3xl font-bold text-warning">
                      {postulacionesPendientes}
                    </div>
                    <div className="text-sm text-secondary mt-1">Pendientes</div>
                  </div>
                  <div className="text-center p-4 primary-soft rounded-xl">
                    <div className="text-3xl font-bold text-primary">
                      {postulaciones.length}
                    </div>
                    <div className="text-sm text-secondary mt-1">Total</div>
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