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
    <div className="min-h-screen surface-page flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="surface-card rounded-2xl shadow-xl p-8 md:p-12 border border-border-subtle">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 success-soft rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 success" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-primary dark:text-white mb-4">
            ¡Registro Exitoso!
          </h1>

          <p className="text-center text-secondary dark:text-gray-300 mb-8">
            Hemos enviado un correo de verificación a:
          </p>

          {/* Email destacado */}
          <div className="primary-soft rounded-xl p-4 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 primary" />
              <span className="font-semibold primary-soft-text">{correo}</span>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="space-y-4 mb-8">
            <h2 className="font-semibold text-primary dark:text-white text-lg">
              Próximos pasos:
            </h2>
            <ol className="space-y-3 text-secondary dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 primary-bg text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>
                  Revisa tu bandeja de entrada y busca el correo de verificación
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 primary-bg text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Haz clic en el enlace de verificación del correo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 primary-bg text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Una vez verificado, podrás iniciar sesión en la plataforma</span>
              </li>
            </ol>
          </div>

          {/* Aviso importante */}
          <div className="primary-soft rounded-lg p-4 mb-6 border border-primary-soft">
            <p className="text-sm primary-soft-text">
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
                  ? "success-soft border border-success"
                  : "warning-soft border border-warning"
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
              className="w-full flex items-center justify-center gap-2 surface-muted text-secondary py-3 rounded-lg font-semibold hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border-subtle"
            >
              {resendingEmail ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
              className="flex items-center justify-center gap-2 w-full primary-bg text-white py-3 rounded-lg font-semibold hover:primary-bg-hover transition-colors"
            >
              Ir al Login
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted">
          <p>
            ¿Necesitas ayuda?{" "}
            <a
              href="mailto:soporte@aptconnect.cl"
              className="primary hover:underline font-semibold"
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
        <div className="min-h-screen surface-page flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-secondary">Cargando...</p>
          </div>
        </div>
      }
    >
      <ExitoRegistroContent />
    </Suspense>
  );
}