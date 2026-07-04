import Link from "next/link";
import { Briefcase, CheckCircle } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 p-12 flex-col justify-between">
      <div>
        <Link href="/" className="flex items-center space-x-3 mb-12">
          <div className="primary-bg p-2 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">APT</span>
        </Link>
        
        <h2 className="text-4xl font-bold text-white mb-6">
          Bienvenido de vuelta
        </h2>
        <p className="text-xl text-brand-200 mb-12">
          Accede a tu cuenta y continúa gestionando tu proceso de reclutamiento con inteligencia artificial.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="primary-soft rounded-lg p-3">
              <CheckCircle className="w-6 h-6 primary" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Análisis Inteligente</h3>
              <p className="text-brand-200 text-sm">IA que evalúa automáticamente cada candidato</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="primary-soft rounded-lg p-3">
              <CheckCircle className="w-6 h-6 primary" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Ranking Automático</h3>
              <p className="text-brand-200 text-sm">Los mejores candidatos aparecen primero</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="primary-soft rounded-lg p-3">
              <CheckCircle className="w-6 h-6 primary" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Gestión Centralizada</h3>
              <p className="text-brand-200 text-sm">Todo tu proceso en un solo lugar</p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-brand-300 text-sm">
        © 2025 APT. Todos los derechos reservados.
      </p>
    </div>
  );
}