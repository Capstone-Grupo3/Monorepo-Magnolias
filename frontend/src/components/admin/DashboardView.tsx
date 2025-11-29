import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  Building2,
  Briefcase,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import CardDataStats from "./dashboard/CardDataStats";

interface DashboardViewProps {
  stats: {
    totalUsuarios: number;
    totalPostulaciones: number;
    totalEmpresas: number;
    totalCargos: number;
  } | null;
  rankings: any[];
  postulacionesStats: any[];
  topCargos: any[];
  refresh: () => void;
}

export default function DashboardView({
  stats,
  rankings,
  postulacionesStats,
  topCargos,
  refresh,
}: DashboardViewProps) {
  return (
    <>
      <div className="flex justify-end mb-8">
        <button
          onClick={refresh}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar datos
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8">
        <CardDataStats title="Total Usuarios" total={stats?.totalUsuarios?.toString() || "0"}>
          <Users className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Total Postulaciones" total={stats?.totalPostulaciones?.toString() || "0"}>
          <FileText className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Total Empresas" total={stats?.totalEmpresas?.toString() || "0"}>
          <Building2 className="text-primary dark:text-white" size={22} />
        </CardDataStats>
        <CardDataStats title="Cargos Activos" total={stats?.totalCargos?.toString() || "0"}>
          <Briefcase className="text-primary dark:text-white" size={22} />
        </CardDataStats>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Postulaciones por Mes
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postulacionesStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Top 5 Cargos más Populares
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCargos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="titulo" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="totalPostulaciones" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Top 10 Mejores Candidatos
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ranking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay datos de rankings disponibles
                  </td>
                </tr>
              ) : (
                rankings.slice(0, 10).map((ranking, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-purple-600 font-bold">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ranking.nombrePostulante}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {ranking.correo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ranking.cargo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ranking.puntaje >= 70
                            ? "bg-green-100 text-green-800"
                            : ranking.puntaje >= 40
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ranking.puntaje.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
