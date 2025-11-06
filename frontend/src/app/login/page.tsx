"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Eye, EyeOff, User, Building2, Mail, Lock, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/lib/validators";

// Componente que maneja los parámetros de búsqueda
function RegistrationSuccess({ onShow }: { onShow: (show: boolean) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      onShow(true);
      setTimeout(() => onShow(false), 5000);
    }
  }, [searchParams, onShow]);

  return null;
}

function LoginPageContent() {
  const { loginEmpresa, loginPostulante, loading, error: authError } = useAuth();

  const [tipoUsuario, setTipoUsuario] = useState<"empresa" | "postulante">("postulante");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Cargar email guardado si existe
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo válido");
      return;
    }

    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Guardar email si "Recordarme" está activado
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const credentials = { correo: email, contrasena: password };

    if (tipoUsuario === "empresa") {
      await loginEmpresa(credentials);
    } else {
      await loginPostulante(credentials);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Componente para manejar mensaje de registro exitoso */}
      <Suspense fallback={null}>
        <RegistrationSuccess onShow={setShowSuccessMessage} />
      </Suspense>
      
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
            Bienvenido de vuelta
          </h2>
          <p className="text-xl text-blue-200 mb-12">
            Accede a tu cuenta y continúa gestionando tu proceso de reclutamiento con inteligencia artificial.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Análisis Inteligente</h3>
                <p className="text-blue-200 text-sm">IA que evalúa automáticamente cada candidato</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Ranking Automático</h3>
                <p className="text-blue-200 text-sm">Los mejores candidatos aparecen primero</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Gestión Centralizada</h3>
                <p className="text-blue-200 text-sm">Todo tu proceso en un solo lugar</p>
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
        <div className="w-full max-w-md">
          {/* Mensaje de éxito */}
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">
                ¡Registro exitoso! Ahora puedes iniciar sesión
              </span>
            </div>
          )}

          <div>
            {/* Header Mobile */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">APT</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-slate-600">
                Accede a tu cuenta APT
              </p>
            </div>

            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-slate-600">
                Ingresa tus credenciales para continuar
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensaje de error */}
            {(error || authError) && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="text-red-500 font-bold">⚠</span>
                <span>{error || authError}</span>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Recordarme y Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Recordarme
                </span>
              </label>
              <Link
                href="/recuperar-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de inicio de sesión */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Link a registro */}
          <Link
            href="/registro"
            className="block w-full text-center py-3 px-4 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Crear una cuenta nueva
          </Link>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Al iniciar sesión, aceptas nuestros{" "}
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
    </div>
  );
}

// Componente principal exportado con Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
