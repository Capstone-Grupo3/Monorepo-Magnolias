export function StatsBar() {
  return (
    <section className="bg-white py-12 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <h3 className="text-center text-lg font-semibold text-slate-600 mb-8">
          ¡Publica, gestiona y contrata talento desde un solo lugar!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900 mb-2">+1500</div>
            <div className="text-slate-600">Clientes en LATAM</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900 mb-2">13</div>
            <div className="text-slate-600">Países</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900 mb-2">19</div>
            <div className="text-slate-600">Portales integrados</div>
          </div>
        </div>
        <p className="text-center text-slate-600 mt-8 max-w-3xl mx-auto">
          APT es la plataforma líder en reclutamiento inteligente con IA, simplificando todo el proceso desde la publicación de vacantes hasta la contratación.
        </p>
      </div>
    </section>
  );
}
