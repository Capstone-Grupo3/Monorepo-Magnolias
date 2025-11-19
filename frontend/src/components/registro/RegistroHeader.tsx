import Link from "next/link";
import { Briefcase } from "lucide-react";

interface RegistroHeaderProps {
  isMobile?: boolean;
}

export function RegistroHeader({ isMobile = false }: RegistroHeaderProps) {
  if (isMobile) {
    return (
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="bg-linear-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
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
    );
  }

  return (
    <div className="hidden lg:block mb-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Crear Cuenta
      </h1>
      <p className="text-slate-600">
        Completa el formulario para comenzar
      </p>
    </div>
  );
}
