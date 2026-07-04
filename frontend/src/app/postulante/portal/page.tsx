"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  User,
  Briefcase,
  FileText,
  Search,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Edit2,
  Save,
  X,
} from "lucide-react";

import { Cargo } from "@/types";

import { usePostulantePortal } from "@/hooks/usePostulantePortal";
import { useCargoFilters } from "@/hooks/useCargoFilters";

import { postulanteService } from "@/services/postulante.service";

import { formatDate, getEstadoColor, formatCurrency } from "@/lib/formatters";
import { validarRUT, formatearRUT } from "@/lib/validators";

import {
  DashboardHeader,
  LoadingSpinner,
  LogoutButton,
  useToast,
  Paginacion,
} from "@/components/shared";
import EmailVerificationBanner from "@/components/shared/EmailVerificationBanner";
import BuscadorCargosV2 from "@/components/postulante/BuscadorCargosV2";

function PortalContent() {
  const toast = useToast();

  const [emailVerificado, setEmailVerificado] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const { postulante, postulaciones, loading: loadingPostulante, crearPostulacion, logout } =
    usePostulantePortal();

  const {
    cargos,
    pagination,
    filtros,
    loading: loadingCargos,
    rangoSalario,
    filtrosActivos,
    setFiltro,
    setRangoSalario,
    setPage,
    limpiarFiltros,
  } = useCargoFilters({ defaultLimit: 12 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verificado = localStorage.getItem("emailVerificado") === "true";
      const email = localStorage.getItem("userEmail") || "";
      setEmailVerificado(verificado);
      setUserEmail(email);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<
    "cargos" | "postulaciones" | "perfil"
  >("cargos");
  const [showModal, setShowModal] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState<Cargo | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string>("");

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilEditado, setPerfilEditado] = useState({
    nombre: "",
    rut: "",
    telefono: "",
    experienciaAnios: 0,
    linkedinUrl: "",
  });
  const [errorRut, setErrorRut] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  useEffect(() => {
    if (postulante) {
      setPerfilEditado({
        nombre: postulante.nombre || "",
        rut: postulante.rut || "",
        telefono: postulante.telefono || "",
        experienciaAnios: postulante.experienciaAnios || 0,
        linkedinUrl: postulante.linkedinUrl || "",
      });
    }
  }, [postulante]);

  const handleLogout = () => {
    logout();
  };

  const handleEditarPerfil = () => {
    setEditandoPerfil(true);
    setErrorRut("");
  };

  const handleCancelarEdicion = () => {
    setEditandoPerfil(false);
    setErrorRut("");
    if (postulante) {
      setPerfilEditado({
        nombre: postulante.nombre || "",
        rut: postulante.rut || "",
        telefono: postulante.telefono || "",
        experienciaAnios: postulante.experienciaAnios || 0,
        linkedinUrl: postulante.linkedinUrl || "",
      });
    }
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rutFormateado = formatearRUT(e.target.value);
    setPerfilEditado({ ...perfilEditado, rut: rutFormateado });

    if (rutFormateado && !validarRUT(rutFormateado)) {
      setErrorRut("RUT inválido");
    } else {
      setErrorRut("");
    }
  };

  const handleGuardarPerfil = async () => {
    if (!postulante) return;

    if (perfilEditado.rut && !validarRUT(perfilEditado.rut)) {
      setErrorRut("Por favor ingresa un RUT válido");
      return;
    }

    setGuardandoPerfil(true);
    try {
      await postulanteService.updatePostulante(postulante.id, perfilEditado);

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userData, ...perfilEditado }));

      toast.success("¡Perfil actualizado!", "Tus datos han sido guardados correctamente.");
      setEditandoPerfil(false);
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast.error("Error al guardar", "No se pudo actualizar el perfil. Intenta nuevamente.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handlePostular = (cargo: Cargo) => {
    setCargoSeleccionado(cargo);
    setRespuestas({});
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setCargoSeleccionado(null);
    setRespuestas({});
    setCvFile(null);
    setCvPreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.warning("Formato no válido", "Solo se permiten archivos PDF");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Archivo muy grande", "El archivo no debe superar 5MB");
        return;
      }

      setCvFile(file);
      setCvPreview(file.name);
    }
  };

  const handleEnviarPostulacion = async () => {
    if (!cargoSeleccionado || !postulante) return;

    const preguntas = cargoSeleccionado.preguntasJson?.preguntas || [];
    if (preguntas.length > 0) {
      const todasRespondidas = preguntas.every((_: any, index: number) =>
        respuestas[`pregunta_${index + 1}`]?.trim()
      );
      if (!todasRespondidas) {
        toast.warning("Respuestas incompletas", "Por favor responde todas las preguntas antes de enviar");
        return;
      }
    }

    setSubmitting(true);
    try {
      await crearPostulacion(cargoSeleccionado.id, respuestas, cvFile || undefined);

      toast.success(
        "¡Postulación enviada!",
        "El análisis con IA se está procesando. Te notificaremos los resultados."
      );
      handleCerrarModal();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al postular", error.message || "No se pudo enviar la postulación. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFiltroChange = useCallback((campo: string, valor: string | number | null) => {
    setFiltro(campo as keyof typeof filtros, valor as any);
  }, [setFiltro]);

  if (loadingPostulante) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen surface-page">
      <DashboardHeader
        icon={Briefcase}
        title="Portal de Postulante"
        subtitle={postulante?.nombre}
        actions={<LogoutButton onLogout={handleLogout} />}
      />

      {!emailVerificado && userEmail && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EmailVerificationBanner userEmail={userEmail} userType="postulante" />
        </div>
      )}

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
                <Search size={20} />
                Cargos Disponibles
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
                <FileText size={20} />
                Mis Postulaciones ({postulaciones.length})
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
                <User size={20} />
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
              <h2 className="text-3xl font-bold text-primary dark:text-white">
                Buscar Oportunidades
              </h2>
            </div>

            <BuscadorCargosV2
              cargosDisponibles={cargos}
              filtros={{
                busqueda: filtros.busqueda || "",
                ubicacion: filtros.ubicacion || "",
                tipoContrato: filtros.tipoContrato || "",
                modalidad: filtros.modalidad || "",
                empresa: filtros.empresa || "",
                salarioMin: filtros.salarioMin ?? null,
                salarioMax: filtros.salarioMax ?? null,
              }}
              rangoSalario={rangoSalario}
              filtrosActivos={filtrosActivos}
              totalResultados={pagination?.total || cargos.length}
              loading={loadingCargos}
              onFiltroChange={handleFiltroChange}
              onRangoSalarioChange={setRangoSalario}
              onLimpiarFiltros={limpiarFiltros}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {cargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="surface-card rounded-2xl border border-border-subtle hover:shadow-lg hover:border-primary/30 transition-all p-6 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {cargo.titulo}
                      </h3>
                      <p className="text-secondary font-semibold">
                        {cargo.empresa.nombre}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl primary-soft flex items-center justify-center shadow-sm">
                      <Briefcase className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <p className="text-secondary mb-4 line-clamp-3 text-sm leading-relaxed">
                    {cargo.descripcion}
                  </p>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-secondary">
                      <div className="primary-soft p-1.5 rounded-lg">
                        <MapPin size={16} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">{cargo.ubicacion}</span>
                      {cargo.modalidad && (
                        <span className="text-xs surface-muted text-muted px-2 py-0.5 rounded-full">
                          {cargo.modalidad === "REMOTO" ? "Remoto" : cargo.modalidad === "HIBRIDO" ? "Híbrido" : "Presencial"}
                        </span>
                      )}
                    </div>
                    {cargo.salarioEstimado && (
                      <div className="flex items-center gap-2.5 text-secondary">
                        <div className="success-soft p-1.5 rounded-lg">
                          <DollarSign size={16} className="text-success" />
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(cargo.salarioEstimado)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-secondary">
                      <div className="primary-soft p-1.5 rounded-lg">
                        <Clock size={16} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {cargo.tipoContrato === "FULL_TIME" ? "Tiempo Completo" :
                         cargo.tipoContrato === "PART_TIME" ? "Medio Tiempo" :
                         cargo.tipoContrato === "PRACTICA" ? "Práctica" :
                         cargo.tipoContrato === "FREELANCE" ? "Freelance" : cargo.tipoContrato}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePostular(cargo)}
                    className="w-full primary-bg text-white py-3 rounded-xl hover:primary-bg-hover transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Postular Ahora
                  </button>
                </div>
              ))}

              {cargos.length === 0 && !loadingCargos && (
                <div className="col-span-2 text-center py-16 surface-card rounded-2xl border border-border-subtle">
                  <div className="surface-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-secondary mb-4">
                    Intenta ajustar los filtros o buscar con otras palabras clave
                  </p>
                  {filtrosActivos > 0 && (
                    <button
                      onClick={limpiarFiltros}
                      className="px-6 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}

              {loadingCargos && (
                <div className="col-span-2 text-center py-16">
                  <LoadingSpinner />
                </div>
              )}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Paginacion
                  meta={pagination}
                  onPageChange={setPage}
                  showInfo={true}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "postulaciones" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary dark:text-white">
              Mis Postulaciones ({postulaciones.length})
            </h2>

            <div className="space-y-4">
              {postulaciones.map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="surface-card rounded-xl border border-border-subtle p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary dark:text-white mb-1">
                        {postulacion.cargo.titulo}
                      </h3>
                      <p className="text-secondary mb-3">
                        {postulacion.cargo.empresa.nombre}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-secondary">
                          <Clock size={16} />
                          <span className="text-sm">
                            {formatDate(postulacion.fechaPostulacion)}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(postulacion.estado)}`}
                          >
                            {postulacion.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {postulacion.scoreCompatibilidad && (
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="text-primary" size={20} />
                          <span className="text-sm text-secondary">Score</span>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {postulacion.scoreCompatibilidad}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {postulaciones.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary dark:text-white mb-2">
                    No tienes postulaciones aún
                  </h3>
                  <p className="text-secondary mb-4">
                    Explora las cargos disponibles y postula a las que te interesen
                  </p>
                  <button
                    onClick={() => setActiveTab("cargos")}
                    className="px-6 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all"
                  >
                    Ver cargos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "perfil" && postulante && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary dark:text-white">Mi Perfil</h2>
              {!editandoPerfil ? (
                <button
                  onClick={handleEditarPerfil}
                  className="flex items-center gap-2 px-4 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelarEdicion}
                    disabled={guardandoPerfil}
                    className="flex items-center gap-2 px-4 py-2 surface-muted text-secondary rounded-lg hover:bg-surface-hover transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarPerfil}
                    disabled={guardandoPerfil || !!errorRut}
                    className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {guardandoPerfil ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
            </div>

            <div className="surface-card rounded-xl border border-border-subtle p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Nombre Completo
                  </label>
                  {editandoPerfil ? (
                    <input
                      type="text"
                      value={perfilEditado.nombre}
                      onChange={(e) =>
                        setPerfilEditado({ ...perfilEditado, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg text-primary dark:text-white">{postulante.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Correo Electrónico
                  </label>
                  <p className="text-lg text-primary dark:text-white">{postulante.correo}</p>
                  <p className="text-xs text-muted mt-1">No editable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    RUT <span className="text-error">*</span>
                  </label>
                  {editandoPerfil ? (
                    <div>
                      <input
                        type="text"
                        value={perfilEditado.rut}
                        onChange={handleRutChange}
                        placeholder="12.345.678-9"
                        className={`w-full px-4 py-2 border rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary ${
                          errorRut ? "border-error" : "border-border-default"
                        }`}
                      />
                      {errorRut && (
                        <p className="text-sm text-error mt-1">{errorRut}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg text-primary dark:text-white">
                      {postulante.rut || <span className="text-muted italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Teléfono
                  </label>
                  {editandoPerfil ? (
                    <input
                      type="tel"
                      value={perfilEditado.telefono}
                      onChange={(e) =>
                        setPerfilEditado({ ...perfilEditado, telefono: e.target.value })
                      }
                      placeholder="+56 9 1234 5678"
                      className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg text-primary dark:text-white">
                      {postulante.telefono || <span className="text-muted italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Años de Experiencia
                  </label>
                  {editandoPerfil ? (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={perfilEditado.experienciaAnios}
                      onChange={(e) =>
                        setPerfilEditado({
                          ...perfilEditado,
                          experienciaAnios: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-lg text-primary dark:text-white">
                      {postulante.experienciaAnios && postulante.experienciaAnios > 0
                        ? `${postulante.experienciaAnios} años`
                        : <span className="text-muted italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Perfil de LinkedIn
                  </label>
                  {editandoPerfil ? (
                    <input
                      type="url"
                      value={perfilEditado.linkedinUrl}
                      onChange={(e) =>
                        setPerfilEditado({ ...perfilEditado, linkedinUrl: e.target.value })
                      }
                      placeholder="https://www.linkedin.com/in/tu-perfil"
                      className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary focus:ring-2 focus:ring-primary"
                    />
                  ) : postulante.linkedinUrl ? (
                    <a
                      href={postulante.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {postulante.linkedinUrl}
                    </a>
                  ) : (
                    <p className="text-muted italic">No especificado</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border-subtle">
                <h3 className="text-lg font-bold text-primary dark:text-white mb-4">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 primary-soft rounded-xl">
                    <div className="text-3xl font-bold text-primary">
                      {postulaciones.length}
                    </div>
                    <div className="text-sm text-secondary mt-1">Postulaciones</div>
                  </div>
                  <div className="text-center p-4 success-soft rounded-xl">
                    <div className="text-3xl font-bold text-success">
                      {postulaciones.filter((p) => p.estado === "Aprobado").length}
                    </div>
                    <div className="text-sm text-secondary mt-1">Aprobadas</div>
                  </div>
                  <div className="text-center p-4 warning-soft rounded-xl">
                    <div className="text-3xl font-bold text-warning">
                      {postulaciones.filter((p) => p.estado === "Pendiente").length}
                    </div>
                    <div className="text-sm text-secondary mt-1">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && cargoSeleccionado && (
        <div className="fixed inset-0 surface-overlay/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-postular-title"
            className="surface-card rounded-2xl shadow-2xl max-w-2xl w-full my-8"
          >
            <div className="border-b border-border-subtle px-6 py-4 flex justify-between items-center">
              <h3 id="modal-postular-title" className="text-2xl font-bold text-primary dark:text-white">
                Postular a {cargoSeleccionado.titulo}
              </h3>
              <button
                onClick={handleCerrarModal}
                className="text-muted hover:text-secondary dark:hover:text-gray-300 text-2xl leading-none p-1 hover:bg-surface-muted rounded-lg transition-colors"
                disabled={submitting}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="primary-soft border border-primary/20 rounded-xl p-4">
                <h4 className="font-semibold text-primary mb-2">
                  {cargoSeleccionado.empresa.nombre}
                </h4>
                <p className="text-sm text-primary/80">
                  {cargoSeleccionado.ubicacion} •{" "}
                  {cargoSeleccionado.tipoContrato}
                </p>
              </div>

              {cargoSeleccionado.preguntasJson?.preguntas?.length > 0 ? (
                <>
                  <div>
                    <h4 className="font-semibold text-primary dark:text-white mb-3">
                      Responde las siguientes preguntas:
                    </h4>
                    <p className="text-sm text-secondary mb-4">
                      Estas respuestas serán analizadas por IA para evaluar tu
                      compatibilidad con el cargo.
                    </p>
                  </div>

                  {cargoSeleccionado.preguntasJson.preguntas.map(
                    (pregunta: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">
                          {index + 1}. {pregunta.pregunta || pregunta}
                          <span className="text-error">*</span>
                        </label>
                        <textarea
                          value={respuestas[`pregunta_${index + 1}`] || ""}
                          onChange={(e) =>
                            setRespuestas({
                              ...respuestas,
                              [`pregunta_${index + 1}`]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-border-default rounded-lg bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary"
                          rows={4}
                          placeholder="Escribe tu respuesta aquí..."
                          disabled={submitting}
                        />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="surface-muted border border-border-subtle rounded-xl p-4 text-center">
                  <p className="text-secondary">
                    Esta cargo no tiene preguntas específicas. Puedes postular directamente.
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-6 mt-6 border-t-2 border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base font-semibold text-primary dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Adjuntar CV (Opcional)
                  </label>
                  <span className="text-xs font-medium text-muted surface-muted px-2 py-1 rounded">
                    PDF - Max 5MB
                  </span>
                </div>

                <div className="relative primary-soft border-2 border-dashed border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-all">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="block w-full text-sm text-secondary
                      file:mr-4 file:py-2.5 file:px-6
                      file:rounded-lg file:border-0
                      file:text-sm file:font-bold
                      file:primary-bg file:text-white
                      hover:file:primary-bg-hover
                      file:shadow-md
                      cursor-pointer
                      focus:outline-none"
                  />
                  <p className="text-xs text-secondary mt-2 text-center">
                    Haz clic en &quot;Seleccionar archivo&quot; o arrastra tu CV aquí
                  </p>
                </div>

                {cvPreview && (
                  <div className="flex items-center justify-between success-soft border border-success/30 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="success-soft p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-success">
                          {cvPreview}
                        </p>
                        <p className="text-xs text-success/80">
                          Archivo listo para enviar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCvFile(null);
                        setCvPreview("");
                      }}
                      disabled={submitting}
                      className="text-error hover:text-error/80 font-medium text-sm"
                    >
                      Remover
                    </button>
                  </div>
                )}

                <div className="primary-soft border border-primary/20 rounded-xl p-3">
                  <p className="text-xs text-primary/80">
                    <strong>Tip:</strong> Adjuntar tu CV permite que la IA realice un análisis más completo y preciso de tu postulación.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border-subtle px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCerrarModal}
                className="px-6 py-2 border border-border-default text-secondary rounded-lg hover:bg-surface-muted transition-all"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarPostulacion}
                className="px-6 py-2 primary-bg text-white rounded-lg hover:primary-bg-hover transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar Postulación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalCandidatoPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PortalContent />
    </Suspense>
  );
}