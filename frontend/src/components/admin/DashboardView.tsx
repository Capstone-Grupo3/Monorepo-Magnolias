"use client";

import { RefreshCw, Users, FileText, Building2, Briefcase, TrendingUp, Calendar } from "lucide-react";
import { DashboardStats, RankingItem, PostulacionStats, TopCargo } from "@/services/admin.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardViewProps {
  stats: DashboardStats | null;
  rankings: RankingItem[];
  postulacionesStats: PostulacionStats[];
  topCargos: TopCargo[];
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
    <div className="space-y-6">
      {/* Botón de refrescar */}
      <div className="flex justify-end">
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar datos
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats?.totalUsuarios || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Postulaciones"
          value={stats?.totalPostulaciones || 0}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Total Empresas"
          value={stats?.totalEmpresas || 0}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          title="Cargos Activos"
          value={stats?.totalCargos || 0}
          icon={Briefcase}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de postulaciones por mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Postulaciones por Mes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={postulacionesStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Postulaciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 cargos con más postulaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top 5 Cargos más Populares
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCargos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="titulo" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalPostulaciones" fill="#8b5cf6" name="Postulaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Rankings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Top 10 Mejores Candidatos
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay datos de ranking disponibles
                  </td>
                </tr>
              ) : (
                rankings.map((rank, index) => (
                  <tr key={`${rank.postulanteId}-${rank.cargo}-${index}`} className={index < 3 ? "bg-purple-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${index < 3 ? "text-purple-600" : "text-gray-900"}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{rank.nombrePostulante}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rank.correo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rank.cargo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rank.empresa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {rank.puntaje.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}
