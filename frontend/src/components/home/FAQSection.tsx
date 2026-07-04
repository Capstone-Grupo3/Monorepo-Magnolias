export function FAQSection() {
  return (
    <section className="py-20 surface-card">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-primary dark:text-white mb-12">
          Preguntas frecuentes
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          <details className="surface-muted rounded-xl p-6 border border-subtle">
            <summary className="font-semibold text-lg text-primary dark:text-white cursor-pointer list-none">
              ¿Qué es un software de recursos humanos con IA?
            </summary>
            <p className="mt-4 text-secondary dark:text-gray-300">
              Es una plataforma que utiliza inteligencia artificial para automatizar y optimizar procesos de reclutamiento,
              desde el análisis de CVs hasta la selección de candidatos ideales.
            </p>
          </details>

          <details className="surface-muted rounded-xl p-6 border border-subtle">
            <summary className="font-semibold text-lg text-primary dark:text-white cursor-pointer list-none">
              ¿Cuáles son las principales funciones de APT?
            </summary>
            <p className="mt-4 text-secondary dark:text-gray-300">
              APT ofrece análisis automático de CVs, ranking inteligente de candidatos, gestión centralizada de vacantes,
              publicación en múltiples portales, y evaluación de respuestas con IA.
            </p>
          </details>

          <details className="surface-muted rounded-xl p-6 border border-subtle">
            <summary className="font-semibold text-lg text-primary dark:text-white cursor-pointer list-none">
              ¿Cómo puede beneficiar a mi empresa un software de reclutamiento con IA?
            </summary>
            <p className="mt-4 text-secondary dark:text-gray-300">
              Reduce hasta un 45% el tiempo de contratación, mejora en un 40% la productividad del equipo de RRHH,
              y aumenta un 25% la conversión de postulantes a contratados.
            </p>
          </details>

          <details className="surface-muted rounded-xl p-6 border border-subtle">
            <summary className="font-semibold text-lg text-primary dark:text-white cursor-pointer list-none">
              ¿Cómo puede un ATS con IA facilitar el proceso de reclutamiento?
            </summary>
            <p className="mt-4 text-secondary dark:text-gray-300">
              La IA analiza automáticamente cada CV, evalúa respuestas de candidatos, genera rankings basados en compatibilidad,
              y destaca a los postulantes más adecuados, ahorrando horas de revisión manual.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}