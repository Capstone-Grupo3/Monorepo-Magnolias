"use client";

import { useState, useEffect, useCallback } from "react";
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

// Importar tipos centralizados
import { Cargo } from "@/types";

// Importar hook personalizado
import { usePostulantePortal } from "@/hooks/usePostulantePortal";

// Importar servicios
import { postulanteService } from "@/services/postulante.service";

// Importar utilidades
import { formatDate, getEstadoColor, formatCurrency } from "@/lib/formatters";
import { validarRUT, formatearRUT } from "@/lib/validators";

// Importar componentes compartidos
import {
  DashboardHeader,
  LoadingSpinner,
  LogoutButton,
  useToast
} from "@/components/shared";
import EmailVerificationBanner from "@/components/shared/EmailVerificationBanner";
import BuscadorCargos from "@/components/postulante/BuscadorCargos";

export default function PortalCandidatoPage() {
  // Hook de notificaciones toast
  const toast = useToast();

  // Estado para verificación de email
  const [emailVerificado, setEmailVerificado] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Usar hook personalizado para toda la lógica
  const { postulante, cargos, postulaciones, loading, crearPostulacion, logout } =
    usePostulantePortal();

  // Verificar estado de email al cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const verificado = localStorage.getItem("emailVerificado") === "true";
      const email = localStorage.getItem("userEmail") || "";
      setEmailVerificado(verificado);
      setUserEmail(email);
    }
  }, []);

  // Estados locales de UI
  const [activeTab, setActiveTab] = useState<
    "cargos" | "postulaciones" | "perfil"
  >("cargos");
  const [showModal, setShowModal] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState<Cargo | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string>("");

  // Estado para cargos filtrados por el buscador
  const [cargosFiltrados, setCargosFiltrados] = useState<Cargo[]>([]);

  // Callback para recibir los cargos filtrados del buscador
  const handleCargosFiltrados = useCallback((cargos: Cargo[]) => {
    setCargosFiltrados(cargos);
  }, []);

  // Estados para edición de perfil
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

  // Inicializar datos de perfil cuando cargue el postulante
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
    // Restaurar valores originales
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

    // Validar RUT si está presente
    if (perfilEditado.rut && !validarRUT(perfilEditado.rut)) {
      setErrorRut("Por favor ingresa un RUT válido");
      return;
    }

    setGuardandoPerfil(true);
    try {
      await postulanteService.updatePostulante(postulante.id, perfilEditado);
      
      // Actualizar localStorage si es necesario
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...userData, ...perfilEditado }));
      
      toast.success("¡Perfil actualizado!", "Tus datos han sido guardados correctamente.");
      setEditandoPerfil(false);
      // Recargar página para actualizar datos
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
      // Validar tipo de archivo
      if (file.type !== "application/pdf") {
        toast.warning("Formato no válido", "Solo se permiten archivos PDF");
        return;
      }

      // Validar tamaño (máximo 5MB)
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

    // Validar que todas las preguntas estén respondidas
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
      // Usar el hook que maneja el servicio correctamente
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-orange-50">
      <DashboardHeader
        icon={Briefcase}
        title="Portal de Postulante"
        subtitle={postulante?.nombre}
        actions={<LogoutButton onLogout={handleLogout} />}
      />

      {/* Email Verification Banner */}
      {!emailVerificado && userEmail && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EmailVerificationBanner userEmail={userEmail} userType="postulante" />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
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
                <Search size={20} />
                Cargos Disponibles
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
                <FileText size={20} />
                Mis Postulaciones ({postulaciones.length})
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
                <User size={20} />
                Mi Perfil
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* cargos Tab */}
        {activeTab === "cargos" && (
          <div className="space-y-6">
            {/* Título de la sección */}
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900">
                Buscar Oportunidades
              </h2>
            </div>

            {/* Componente de búsqueda y filtros */}
            <BuscadorCargos cargos={cargos} onResultados={handleCargosFiltrados} />

            {/* Grid de cargos filtrados */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {cargosFiltrados.map((cargo) => (
                <div
                  key={cargo.id}
                  className="bg-white rounded-2xl shadow-md border border-slate-200 hover:shadow-xl hover:border-orange-200 transition-all p-6 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {cargo.titulo}
                      </h3>
                      <p className="text-slate-600 font-semibold">
                        {cargo.empresa.nombre}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-sm">
                      <Briefcase className="w-7 h-7 text-orange-500" />
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                    {cargo.descripcion}
                  </p>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="bg-orange-50 p-1.5 rounded-lg">
                        <MapPin size={16} className="text-orange-500" />
                      </div>
                      <span className="text-sm font-medium">{cargo.ubicacion}</span>
                      {cargo.modalidad && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {cargo.modalidad === "REMOTO" ? "Remoto" : cargo.modalidad === "HIBRIDO" ? "Híbrido" : "Presencial"}
                        </span>
                      )}
                    </div>
                    {cargo.salarioEstimado && (
                      <div className="flex items-center gap-2.5 text-slate-700">
                        <div className="bg-green-50 p-1.5 rounded-lg">
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(cargo.salarioEstimado)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <div className="bg-blue-50 p-1.5 rounded-lg">
                        <Clock size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {cargo.tipoContrato === "FULL_TIME" ? "Tiempo Completo" :
                         cargo.tipoContrato === "PART_TIME" ? "Medio Tiempo" :
                         cargo.tipoContrato === "CONTRACTOR" ? "Contratista" :
                         cargo.tipoContrato === "TEMPORARY" ? "Temporal" :
                         cargo.tipoContrato === "INTERNSHIP" ? "Práctica" : cargo.tipoContrato}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePostular(cargo)}
                    className="w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Postular Ahora
                  </button>
                </div>
              ))}

              {cargosFiltrados.length === 0 && cargos.length > 0 && (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Intenta ajustar los filtros o buscar con otras palabras clave
                  </p>
                </div>
              )}

              {cargos.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    No hay cargos disponibles
                  </h3>
                  <p className="text-slate-600">
                    Vuelve más tarde para ver nuevas oportunidades laborales
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Postulaciones Tab */}
        {activeTab === "postulaciones" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Mis Postulaciones ({postulaciones.length})
            </h2>

            <div className="space-y-4">
              {postulaciones.map((postulacion) => (
                <div
                  key={postulacion.id}
                  className="bg-white rounded-xl shadow-xs border p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {postulacion.cargo.titulo}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {postulacion.cargo.empresa.nombre}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
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
                          <TrendingUp className="text-blue-600" size={20} />
                          <span className="text-sm text-gray-600">Score</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {postulacion.scoreCompatibilidad}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {postulaciones.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No tienes postulaciones aún
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Explora las cargos disponibles y postula a las que te
                    interesen
                  </p>
                  <button
                    onClick={() => setActiveTab("cargos")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Ver cargos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === "perfil" && postulante && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
              {!editandoPerfil ? (
                <button
                  onClick={handleEditarPerfil}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar Perfil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelarEdicion}
                    disabled={guardandoPerfil}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarPerfil}
                    disabled={guardandoPerfil || !!errorRut}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {guardandoPerfil ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-xs border p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  {editandoPerfil ? (
                    <input
                      type="text"
                      value={perfilEditado.nombre}
                      onChange={(e) =>
                        setPerfilEditado({ ...perfilEditado, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-gray-800">{postulante.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <p className="text-lg text-gray-800">{postulante.correo}</p>
                  <p className="text-xs text-gray-500 mt-1">No editable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RUT <span className="text-red-500">*</span>
                  </label>
                  {editandoPerfil ? (
                    <div>
                      <input
                        type="text"
                        value={perfilEditado.rut}
                        onChange={handleRutChange}
                        placeholder="12.345.678-9"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errorRut ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errorRut && (
                        <p className="text-sm text-red-600 mt-1">{errorRut}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-lg text-gray-800">
                      {postulante.rut || <span className="text-gray-400 italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-gray-800">
                      {postulante.telefono || <span className="text-gray-400 italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-lg text-gray-800">
                      {postulante.experienciaAnios && postulante.experienciaAnios > 0
                        ? `${postulante.experienciaAnios} años`
                        : <span className="text-gray-400 italic">No especificado</span>}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : postulante.linkedinUrl ? (
                    <a
                      href={postulante.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {postulante.linkedinUrl}
                    </a>
                  ) : (
                    <p className="text-gray-400 italic">No especificado</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {postulaciones.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Postulaciones
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {
                        postulaciones.filter((p) => p.estado === "Aprobado")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Aprobadas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {
                        postulaciones.filter((p) => p.estado === "Pendiente")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Postulación */}
      {showModal && cargoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-2xl font-bold text-gray-800">
                Postular a {cargoSeleccionado.titulo}
              </h3>
              <button
                onClick={handleCerrarModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {cargoSeleccionado.empresa.nombre}
                </h4>
                <p className="text-sm text-blue-700">
                  {cargoSeleccionado.ubicacion} •{" "}
                  {cargoSeleccionado.tipoContrato}
                </p>
              </div>

              {cargoSeleccionado.preguntasJson?.preguntas?.length > 0 ? (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Responde las siguientes preguntas:
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Estas respuestas serán analizadas por IA para evaluar tu
                      compatibilidad con el cargo.
                    </p>
                  </div>

                  {cargoSeleccionado.preguntasJson.preguntas.map(
                    (pregunta: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {index + 1}. {pregunta.pregunta || pregunta}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={respuestas[`pregunta_${index + 1}`] || ""}
                          onChange={(e) =>
                            setRespuestas({
                              ...respuestas,
                              [`pregunta_${index + 1}`]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Escribe tu respuesta aquí..."
                          disabled={submitting}
                        />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600">
                    Esta cargo no tiene preguntas específicas. Puedes postular
                    directamente.
                  </p>
                </div>
              )}

              {/* Campo para adjuntar CV */}
              <div className="space-y-3 pt-6 mt-6 border-t-2 border-gray-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Adjuntar CV (Opcional)
                  </label>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    PDF - Max 5MB
                  </span>
                </div>
                
                <div className="relative bg-linear-to-r from-orange-50 to-orange-100 border-2 border-dashed border-orange-300 rounded-lg p-4 hover:border-orange-500 transition-all">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="block w-full text-sm text-gray-700
                      file:mr-4 file:py-2.5 file:px-6
                      file:rounded-lg file:border-0
                      file:text-sm file:font-bold
                      file:bg-linear-to-r file:from-orange-500 file:to-orange-600
                      file:text-white
                      hover:file:from-orange-600 hover:file:to-orange-700
                      file:shadow-md
                      cursor-pointer
                      focus:outline-none"
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    📎 Haz clic en "Seleccionar archivo" o arrastra tu CV aquí
                  </p>
                </div>

                {cvPreview && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          {cvPreview}
                        </p>
                        <p className="text-xs text-green-700">
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
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Remover
                    </button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Adjuntar tu CV permite que la IA realice un análisis más completo y preciso de tu postulación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-t px-6 py-4 flex gap-3 justify-end rounded-b-xl">
              <button
                onClick={handleCerrarModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarPostulacion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
