export function StatsBar() {
  return (
    <section className="surface-card py-12 border-b border-subtle">
      <div className="container mx-auto px-6">
        <h3 className="text-center text-lg font-semibold text-secondary mb-8">
          ¡Publica, gestiona y contrata talento desde un solo lugar!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary dark:text-white mb-2">+1500</div>
            <div className="text-secondary dark:text-gray-400">Clientes en LATAM</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary dark:text-white mb-2">13</div>
            <div className="text-secondary dark:text-gray-400">Países</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary dark:text-white mb-2">19</div>
            <div className="text-secondary dark:text-gray-400">Portales integrados</div>
          </div>
        </div>
        <p className="text-center text-secondary dark:text-gray-400 mt-8 max-w-3xl mx-auto">
          APT es la plataforma líder en reclutamiento inteligente con IA, simplificando todo el proceso desde la publicación de vacantes hasta la contratación.
        </p>
      </div>
    </section>
  );
}