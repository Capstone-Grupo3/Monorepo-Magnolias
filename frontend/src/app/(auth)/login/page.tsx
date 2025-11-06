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
