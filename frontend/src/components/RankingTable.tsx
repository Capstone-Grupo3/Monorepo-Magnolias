import { Trophy, Medal, Award, User } from "lucide-react";
import { PostulanteRanking } from "@/types";
import { getPuntajeColor, formatDateShort } from "@/lib/formatters";

interface RankingTableProps {
  postulantes: PostulanteRanking[];
  onSelectPostulante?: (Postulante: PostulanteRanking) => void;
}

export default function RankingTable({
  postulantes,
  onSelectPostulante,
}: RankingTableProps) {
  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return (
      <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-semibold">
        {position}
      </span>
    );
  };

  if (postulantes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No hay postulaciones aún
        </h3>
        <p className="text-gray-500">
          Cuando los postulantes postulen, aparecerán aquí con su ranking de IA.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Ranking de postulantes</h2>
        <p className="text-blue-100 text-sm mt-1">
          Evaluación automática por IA • {postulantes.length} postulaciones
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Postulante
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Puntaje IA
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha Postulación
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {postulantes.map((Postulante, index) => (
              <tr
                key={Postulante.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectPostulante?.(Postulante)}
              >
                {/* Posición */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(index + 1)}
                  </div>
                </td>

                {/* Postulante */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {Postulante.nombre_completo}
                    </p>
                    <p className="text-xs text-gray-500">{Postulante.email}</p>
                  </div>
                </td>

                {/* Puntaje */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${getPuntajeColor(
                        Postulante.puntajeIa
                      )}`}
                    >
                      {Postulante.puntajeIa.toFixed(1)} / 100
                    </span>
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDateShort(Postulante.fecha_postulacion)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPostulante?.(Postulante);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Ver Perfil →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Excelente (80-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Bueno (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Regular (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Bajo (&lt;40)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
