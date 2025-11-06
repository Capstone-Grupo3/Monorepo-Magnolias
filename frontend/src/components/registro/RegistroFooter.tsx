import Link from "next/link";

export function RegistroFooter() {
  return (
    <>
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
    </>
  );
}
