"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/lib/validators";
import {
  BrandingSection,
  UserTypeSelector,
  LoginHeader,
  LoginForm,
  LoginFooter,
  SuccessMessage
} from "@/components/login";
import { OAuthSection } from "@/components/shared/OAuthButtons";
import { authService } from "@/services/auth.service";
import { useToast } from "@/components/shared";

// Componente que maneja los parámetros de búsqueda
function RegistrationSuccess({ onShow }: { onShow: (show: boolean) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered") === "true" || searchParams?.get("verified") === "true") {
      onShow(true);
      setTimeout(() => onShow(false), 5000);
    }
  }, [searchParams, onShow]);

  return null;
}

function LoginPageContent() {
  const { loginEmpresa, loginPostulante, loading, error: authError } = useAuth();
  const toast = useToast();

  const [tipoUsuario, setTipoUsuario] = useState<"empresa" | "postulante">("postulante");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailNotVerifiedError, setEmailNotVerifiedError] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Cargar email guardado si existe
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Listener para recibir el token del OAuth callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Verificar que el mensaje viene del backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      if (event.origin !== backendUrl) return;

      const { access_token, user } = event.data;
      
      if (access_token && user) {
        // Guardar token en localStorage
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Redirigir al dashboard correspondiente
        if (user.tipo === "empresa") {
          window.location.href = "/empresa/dashboard";
        } else {
          window.location.href = "/postulante/portal";
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const handleLinkedInLogin = async () => {
    try {
      if (tipoUsuario === "empresa") {
        await authService.loginLinkedInEmpresa();
      } else {
        await authService.loginLinkedInPostulante();
      }
    } catch (error) {
      console.error('Error OAuth LinkedIn:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (tipoUsuario === "empresa") {
        await authService.loginGoogleEmpresa();
      } else {
        await authService.loginGooglePostulante();
      }
    } catch (error) {
      console.error('Error OAuth Google:', error);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Ingresa tu correo electrónico");
      return;
    }

    setResendingEmail(true);
    try {
      if (tipoUsuario === "empresa") {
        await authService.reenviarVerificacionEmpresa(email);
      } else {
        await authService.reenviarVerificacionPostulante(email);
      }
      setError("");
      setEmailNotVerifiedError(false);
      toast.success(
        "Correo enviado",
        "Se ha enviado un nuevo correo de verificación. Revisa tu bandeja de entrada."
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al reenviar el correo de verificación");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerifiedError(false);

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

    try {
      if (tipoUsuario === "empresa") {
        await loginEmpresa(credentials);
      } else {
        await loginPostulante(credentials);
      }
    } catch (err: any) {
      const errorMessage = err?.message || authError || "";
      
      // Detectar error de email no verificado
      if (errorMessage.toLowerCase().includes("verificar") || 
          errorMessage.toLowerCase().includes("verify")) {
        setEmailNotVerifiedError(true);
        setError("Tu correo electrónico no ha sido verificado. Por favor, revisa tu bandeja de entrada.");
      } else if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("intentos")) {
        setError("Demasiados intentos de login. Por favor, intenta más tarde.");
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Componente para manejar mensaje de registro exitoso */}
      <Suspense fallback={null}>
        <RegistrationSuccess onShow={setShowSuccessMessage} />
      </Suspense>
      
      {/* Left Side - Branding */}
      <BrandingSection />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mensaje de éxito */}
          <SuccessMessage show={showSuccessMessage} />

          <div>
            {/* Header Mobile */}
            <LoginHeader isMobile />

            {/* Header Desktop */}
            <LoginHeader />

            {/* Selector de tipo de usuario */}
            <UserTypeSelector 
              tipoUsuario={tipoUsuario}
              onTipoChange={setTipoUsuario}
            />

            {/* Botones OAuth */}
            <div className="mb-6">
              <OAuthSection
                userType={tipoUsuario}
                onLinkedInClick={handleLinkedInLogin}
                onGoogleClick={handleGoogleLogin}
                disabled={loading}
              />
            </div>

            {/* Mensaje de error de email no verificado */}
            {emailNotVerifiedError && (
              <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  Tu correo electrónico no ha sido verificado. ¿No recibiste el correo de verificación?
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendingEmail ? "Reenviando..." : "Reenviar correo de verificación"}
                </button>
              </div>
            )}

            {/* Formulario de login */}
            <LoginForm
              email={email}
              password={password}
              showPassword={showPassword}
              rememberMe={rememberMe}
              loading={loading}
              error={error}
              authError={authError}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onShowPasswordToggle={() => setShowPassword(!showPassword)}
              onRememberMeChange={setRememberMe}
              onSubmit={handleSubmit}
            />

            {/* Footer con link a registro */}
            <LoginFooter />
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
