import Link from "next/link";
import { Briefcase, CheckCircle, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 bg-linear-to-br from-brand-900 via-brand-800 to-brand-950 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <h1 className="text-title-lg lg:text-title-xl font-extrabold text-white leading-tight mb-6">
              El software de <span className="text-brand-400">reclutamiento</span> preferido por los equipos de RRHH
            </h1>

            <p className="text-xl text-brand-200 mb-8 leading-relaxed">
              Optimiza tu gestión de talento con el ATS impulsado por IA más elegido de LATAM
            </p>

            <Link
              href="/registro?tipo=empresa"
              className="inline-flex items-center gap-2 rounded-lg primary-bg-hover px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all"
            >
              Agendar demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex-1">
            <div className="surface-card dark:surface-card/90 rounded-2xl p-8 border border-brand-800/30 shadow-xl dark:shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-6">
                <Briefcase className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">Portal de Reclutamiento IA</h3>
                <p className="text-brand-200">Análisis inteligente de candidatos en tiempo real</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 surface-muted dark:surface-muted rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-secondary dark:text-gray-300">Evaluación automática de CVs</span>
                </div>
                <div className="flex items-center gap-3 surface-muted dark:surface-muted rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-secondary dark:text-gray-300">Ranking inteligente de postulantes</span>
                </div>
                <div className="flex items-center gap-3 surface-muted dark:surface-muted rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-secondary dark:text-gray-300">Gestión centralizada de vacantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}