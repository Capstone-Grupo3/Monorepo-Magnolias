import { FileText, BarChart3, Users, CheckCircle, Sparkles } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Reclutamiento simplificado y efectivo
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Facilitamos el proceso de reclutamiento desde la publicación de vacantes hasta la contratación del candidato. 
            El enfoque se encuentra en la detección y selección de potenciales talentos de manera rápida y eficiente.
          </p>
        </div>
        
        <div className="grid gap-12 lg:gap-16">
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                Experiencia del Postulante
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Enfoque en la experiencia del postulante
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Permitimos a los candidatos postularse de manera rápida y sencilla con un formulario totalmente 
                personalizable, para lograr una experiencia positiva desde el primer contacto con la empresa.
              </p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
              <FileText className="w-24 h-24 text-orange-500 mx-auto" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                Gestión Centralizada
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Gestión de talento humano centralizada
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Esto abarca desde la publicación de vacantes hasta la contratación, la plataforma ofrece 
                herramientas integradas que facilitan este proceso, optimizando así lo respectivo a recursos humanos.
              </p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
              <BarChart3 className="w-24 h-24 text-orange-500 mx-auto" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                Colaboración Integral
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Colaboración integral en la selección
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Desde el reclutador hasta los equipos de recursos humanos y gerentes forman parte de este proceso. 
                La plataforma ofrece funcionalidades que permiten una comunicación fluida y la toma de decisiones 
                de forma colaborativa, asegurando así una selección más efectiva de postulantes.
              </p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl p-12 border border-gray-200">
              <Users className="w-24 h-24 text-orange-500 mx-auto" />
            </div>
          </div>

          {/* Feature 4 - IA Highlight */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-12">
            <div className="flex-1">
              <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm mb-4">
                🤖 Inteligencia Artificial
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                IA en el proceso de reclutamiento y selección
              </h3>
              <p className="text-blue-200 text-lg leading-relaxed mb-6">
                Contamos con 3 módulos que trabajan con Inteligencia Artificial para el proceso de reclutamiento y selección:
              </p>
              <ul className="space-y-3 text-blue-100">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <span>Generación de descripción y preguntas de vacante.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <span>Análisis automático de CVs y respuestas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <span>Destaque de postulantes recomendados con ranking inteligente.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-slate-800 rounded-2xl p-12 border border-blue-800/30">
                <Sparkles className="w-24 h-24 text-orange-500 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
