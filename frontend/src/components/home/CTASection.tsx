import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTASection() {
  return (
    <section id="precios" className="relative py-24 overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-950">
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="mb-6 text-5xl font-bold text-white">
          ¿Listo para revolucionar tu contratación?
        </h2>
        <p className="mb-10 text-xl text-brand-200 max-w-2xl mx-auto">
          Únete a las empresas que ya confían en la IA para construir equipos de alto rendimiento. Empieza hoy mismo tu MVP.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/registro?tipo=empresa"
            className="group rounded-xl primary-bg-hover px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all flex items-center gap-2"
          >
            Crear mi cuenta ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-brand-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 primary" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 primary" />
            <span>Configuración en minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 primary" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}