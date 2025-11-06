"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Eye, EyeOff, Building2, User, ArrowRight, CheckCircle } from "lucide-react";

export default function RegistroPage() {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<"empresa" | "postulante">(
    "postulante"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Formulario Empresa
  const [empresaForm, setEmpresaForm] = useState({
    rut: "",
    nombre: "",
    correo: "",
    contrasena: "",
    descripcion: "",
    logoUrl: "",
  });

  // Formulario Postulante
  const [postulanteForm, setPostulanteForm] = useState({
    rut: "",
    nombre: "",
    correo: "",
    contrasena: "",
    telefono: "",
    linkedinUrl: "",
    experienciaAnios: 0,
  });

  const handleSubmitEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar que el RUT no esté vacío
    if (!empresaForm.rut.trim()) {
      setError("El RUT de la empresa es requerido");
      setLoading(false);
      return;
    }

    try {
      // Construir payload solo con campos no vacíos para los opcionales
      const payload = {
        rut: empresaForm.rut.trim(),
        nombre: empresaForm.nombre,
        correo: empresaForm.correo,
        contrasena: empresaForm.contrasena,
        ...(empresaForm.descripcion && { descripcion: empresaForm.descripcion }),
        ...(empresaForm.logoUrl && { logoUrl: empresaForm.logoUrl }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/empresas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar empresa");
      }

      // Redirigir a login después del registro exitoso
      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPostulante = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar que el RUT no esté vacío
    if (!postulanteForm.rut.trim()) {
      setError("El RUT es requerido");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        rut: postulanteForm.rut.trim(),
        nombre: postulanteForm.nombre,
        correo: postulanteForm.correo,
        contrasena: postulanteForm.contrasena,
        ...(postulanteForm.telefono && { telefono: postulanteForm.telefono }),
        ...(postulanteForm.linkedinUrl && { linkedinUrl: postulanteForm.linkedinUrl }),
        ...(postulanteForm.experienciaAnios > 0 && { experienciaAnios: postulanteForm.experienciaAnios }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/Postulantes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar postulante");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center space-x-3 mb-12">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">APT</span>
          </Link>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Únete a la revolución del reclutamiento
          </h2>
          <p className="text-xl text-blue-200 mb-12">
            Crea tu cuenta y comienza a aprovechar el poder de la inteligencia artificial en tu proceso de selección.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Sin tarjeta de crédito</h3>
                <p className="text-blue-200 text-sm">Comienza gratis, sin compromisos</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Configuración en minutos</h3>
                <p className="text-blue-200 text-sm">Empieza a publicar vacantes al instante</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Soporte dedicado</h3>
                <p className="text-blue-200 text-sm">Te acompañamos en cada paso</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-blue-300 text-sm">
          © 2025 APT. Todos los derechos reservados.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Header Mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">APT</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-slate-600">
              Únete a nuestra plataforma de reclutamiento inteligente
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-slate-600">
              Completa el formulario para comenzar
            </p>
          </div>

          {/* Selector de tipo de usuario */}
          <div className="flex gap-3 mb-6 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTipoUsuario("postulante")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                tipoUsuario === "postulante"
                  ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <User size={20} />
              <span>Postulante</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoUsuario("empresa")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                tipoUsuario === "empresa"
                  ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Building2 size={20} />
              <span>Empresa</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
              <span className="text-red-500 font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario Postulante */}
          {tipoUsuario === "postulante" && (
            <form onSubmit={handleSubmitPostulante} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    RUT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postulanteForm.rut}
                    onChange={(e) =>
                      setPostulanteForm({
                        ...postulanteForm,
                        rut: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="12.345.678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postulanteForm.nombre}
                    onChange={(e) =>
                      setPostulanteForm({
                        ...postulanteForm,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Juan Pérez González"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={postulanteForm.correo}
                    onChange={(e) =>
                      setPostulanteForm({
                        ...postulanteForm,
                        correo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="juan@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={postulanteForm.telefono}
                    onChange={(e) =>
                      setPostulanteForm({
                        ...postulanteForm,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={postulanteForm.contrasena}
                    onChange={(e) =>
                      setPostulanteForm({
                        ...postulanteForm,
                        contrasena: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Perfil LinkedIn
                </label>
                <input
                  type="url"
                  value={postulanteForm.linkedinUrl}
                  onChange={(e) =>
                    setPostulanteForm({
                      ...postulanteForm,
                      linkedinUrl: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Años de Experiencia
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={postulanteForm.experienciaAnios}
                  onChange={(e) =>
                    setPostulanteForm({
                      ...postulanteForm,
                      experienciaAnios: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Ej: 3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Crear Cuenta de Postulante
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Formulario Empresa */}
          {tipoUsuario === "empresa" && (
            <form onSubmit={handleSubmitEmpresa} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  RUT de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.rut}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, rut: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="76.123.456-7"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={empresaForm.nombre}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Tech Solutions SpA"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Corporativo <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={empresaForm.correo}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, correo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={empresaForm.contrasena}
                    onChange={(e) =>
                      setEmpresaForm({
                        ...empresaForm,
                        contrasena: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={empresaForm.descripcion}
                  onChange={(e) =>
                    setEmpresaForm({
                      ...empresaForm,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  placeholder="Cuéntanos sobre tu empresa, sector, misión y valores..."
                />
                <p className="text-xs text-gray-500 mt-1">Esta información será visible para los candidatos</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Logo URL (opcional)
                </label>
                <input
                  type="url"
                  value={empresaForm.logoUrl}
                  onChange={(e) =>
                    setEmpresaForm({ ...empresaForm, logoUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Crear Cuenta de Empresa
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          {/* Link a login */}
          <Link
            href="/login"
            className="block w-full text-center py-3 px-4 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Iniciar Sesión
          </Link>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Al crear una cuenta, aceptas nuestros{" "}
            <Link href="/terminos" className="text-orange-600 hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="text-orange-600 hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
