import Link from "next/link";
import { Briefcase, CheckCircle } from "lucide-react";

export function RegistroBrandingSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 p-12 flex-col justify-between">
      <div>
        <Link href="/" className="flex items-center space-x-3 mb-12">
          <div className="bg-linear-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
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
  );
}
