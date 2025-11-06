import Link from "next/link";
import { Briefcase, CheckCircle, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              El software de <span className="text-orange-500">reclutamiento</span> preferido por los equipos de RRHH
            </h1>
            
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              Optimiza tu gestión de talento con el ATS impulsado por IA más elegido de LATAM
            </p>
            
            <Link
              href="/registro?tipo=empresa"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-orange-700 shadow-xl transition-all"
            >
              Agendar demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex-1">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-blue-800/30 shadow-2xl">
              <div className="text-center mb-6">
                <Briefcase className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Portal de Reclutamiento IA</h3>
                <p className="text-blue-200">Análisis inteligente de candidatos en tiempo real</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-blue-100">Evaluación automática de CVs</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-blue-100">Ranking inteligente de postulantes</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-blue-100">Gestión centralizada de vacantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
