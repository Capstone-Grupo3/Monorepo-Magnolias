export function ProcessSection() {
  return (
    <section id="como-funciona" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Tu proceso de selección en 3 simples pasos
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
              1
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Publica tu Vacante</h3>
            <p className="text-slate-600 leading-relaxed">
              Describe el puesto y define las preguntas clave que la IA usará para filtrar a los candidatos.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
              2
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Recibe Postulaciones</h3>
            <p className="text-slate-600 leading-relaxed">
              Los candidatos aplican y responden tus preguntas. Nuestra IA comienza a analizar cada perfil en tiempo real.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
              3
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Selecciona al Mejor</h3>
            <p className="text-slate-600 leading-relaxed">
              Accede al ranking de candidatos, revisa los perfiles mejor calificados y contacta al talento ideal para tu empresa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
