export function ImpactSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">
          Impacto en la eficiencia y resultados del equipo de Recursos Humanos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="text-6xl font-bold text-orange-500 mb-3">+40%</div>
            <div className="text-slate-700 text-lg font-medium">
              De mejora en la productividad del equipo de Recursos Humanos
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="text-6xl font-bold text-orange-500 mb-3">45%</div>
            <div className="text-slate-700 text-lg font-medium">
              De reducción en el tiempo de contratación
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="text-6xl font-bold text-orange-500 mb-3">25%</div>
            <div className="text-slate-700 text-lg font-medium">
              Más de conversión de postulantes a contratados
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
