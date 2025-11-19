"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerificarEmailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token as string;
  const tipo = searchParams.get("tipo"); // 'empresa' o 'postulante'

  const [estado, setEstado] = useState<"cargando" | "exito" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    verificarEmail();
  }, [token, tipo]);

  const verificarEmail = async () => {
    try {
      if (!tipo || (tipo !== "empresa" && tipo !== "postulante")) {
        setEstado("error");
        setMensaje("Tipo de usuario no válido");
        return;
      }

      let response;
      if (tipo === "empresa") {
        response = await authService.verificarEmailEmpresa(token);
      } else {
        response = await authService.verificarEmailPostulante(token);
      }

      setEstado("exito");
      setMensaje(response.mensaje || "Email verificado exitosamente");

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push(`/login?verified=true&tipo=${tipo}`);
      }, 3000);
    } catch (error: any) {
      setEstado("error");
      setMensaje(
        error.response?.data?.message ||
        error.message ||
        "Error al verificar el email. El token puede haber expirado."
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* Icono de estado */}
          <div className="flex justify-center mb-6">
            {estado === "cargando" && (
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              </div>
            )}
            {estado === "exito" && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {estado === "error" && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {estado === "cargando" && "Verificando tu email..."}
            {estado === "exito" && "¡Email verificado!"}
            {estado === "error" && "Error de verificación"}
          </h1>

          {/* Mensaje */}
          <p className="text-center text-gray-600 mb-6">{mensaje}</p>

          {/* Estado específico */}
          {estado === "cargando" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-sm text-orange-800">
                Por favor espera mientras verificamos tu correo electrónico...
              </p>
            </div>
          )}

          {estado === "exito" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  Tu cuenta ha sido activada exitosamente. Serás redirigido al login en unos segundos...
                </p>
              </div>
              <Link
                href={`/login?tipo=${tipo}`}
                className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Ir al Login
              </Link>
            </div>
          )}

          {estado === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 text-center">
                  Si el token ha expirado, puedes solicitar un nuevo correo de verificación desde la página de login.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¿Necesitas ayuda? Contacta a soporte@aptconnect.cl</p>
        </div>
      </div>
    </div>
  );
}
