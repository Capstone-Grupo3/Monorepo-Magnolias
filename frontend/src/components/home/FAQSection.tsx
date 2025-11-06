export function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
          Preguntas frecuentes
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-4">
          <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
            <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
              ¿Qué es un software de recursos humanos con IA?
            </summary>
            <p className="mt-4 text-slate-600">
              Es una plataforma que utiliza inteligencia artificial para automatizar y optimizar procesos de reclutamiento, 
              desde el análisis de CVs hasta la selección de candidatos ideales.
            </p>
          </details>

          <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
            <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
              ¿Cuáles son las principales funciones de APT?
            </summary>
            <p className="mt-4 text-slate-600">
              APT ofrece análisis automático de CVs, ranking inteligente de candidatos, gestión centralizada de vacantes, 
              publicación en múltiples portales, y evaluación de respuestas con IA.
            </p>
          </details>

          <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
            <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
              ¿Cómo puede beneficiar a mi empresa un software de reclutamiento con IA?
            </summary>
            <p className="mt-4 text-slate-600">
              Reduce hasta un 45% el tiempo de contratación, mejora en un 40% la productividad del equipo de RRHH, 
              y aumenta un 25% la conversión de postulantes a contratados.
            </p>
          </details>

          <details className="bg-slate-50 rounded-xl p-6 border border-gray-200">
            <summary className="font-semibold text-lg text-slate-900 cursor-pointer">
              ¿Cómo puede un ATS con IA facilitar el proceso de reclutamiento?
            </summary>
            <p className="mt-4 text-slate-600">
              La IA analiza automáticamente cada CV, evalúa respuestas de candidatos, genera rankings basados en compatibilidad, 
              y destaca a los postulantes más adecuados, ahorrando horas de revisión manual.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
