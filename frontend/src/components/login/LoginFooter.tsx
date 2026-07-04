import Link from "next/link";

export function LoginFooter() {
  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 surface-card text-muted">
            ¿No tienes cuenta?
          </span>
        </div>
      </div>

      {/* Link a registro */}
      <Link
        href="/registro"
        className="block w-full text-center py-3 px-4 border border-border-default rounded-lg font-semibold text-secondary hover:bg-surface-muted hover:border-border-default transition-all"
      >
        Crear una cuenta nueva
      </Link>

      {/* Footer */}
      <p className="text-center text-sm text-muted mt-6">
        Al iniciar sesión, aceptas nuestros{" "}
        <Link href="/terminos" className="primary hover:underline">
          Términos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="/privacidad" className="primary hover:underline">
          Política de Privacidad
        </Link>
      </p>
    </>
  );
}