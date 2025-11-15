"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

function ExitoRegistroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipo = searchParams?.get("tipo") as "empresa" | "postulante" | null;
  const correo = searchParams?.get("correo") || "";

  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!tipo || !correo) {
      router.push("/registro");
    }
  }, [tipo, correo, router]);

  const handleResendEmail = async () => {
    if (!correo || !tipo) return;

    setResendingEmail(true);
    setResendMessage("");

    try {
      if (tipo === "empresa") {
        await authService.reenviarVerificacionEmpresa(correo);
      } else {
        await authService.reenviarVerificacionPostulante(correo);
      }
      setResendMessage("✓ Correo de verificación reenviado exitosamente");
    } catch (error: any) {
      setResendMessage(
        "⚠ Error al reenviar el correo. Por favor, intenta más tarde."
      );
    } finally {
      setResendingEmail(false);
    }
  };

  if (!tipo || !correo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-green-100">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Hemos enviado un correo de verificación a:
          </p>

          {/* Email destacado */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-900">{correo}</span>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="space-y-4 mb-8">
            <h2 className="font-semibold text-gray-900 text-lg">
              Próximos pasos:
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>
                  Revisa tu bandeja de entrada y busca el correo de verificación
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Haz clic en el enlace de verificación del correo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Una vez verificado, podrás iniciar sesión en la plataforma</span>
              </li>
            </ol>
          </div>

          {/* Aviso importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Si no encuentras el correo, revisa tu carpeta
              de spam o correo no deseado. El enlace de verificación expira en 24
              horas.
            </p>
          </div>

          {/* Mensaje de reenvío */}
          {resendMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                resendMessage.includes("✓")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              {resendMessage}
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={resendingEmail}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendingEmail ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Reenviar correo de verificación
                </>
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Ir al Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            ¿Necesitas ayuda?{" "}
            <a
              href="mailto:soporte@aptconnect.cl"
              className="text-orange-600 hover:underline font-semibold"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExitoRegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ExitoRegistroContent />
    </Suspense>
  );
}
