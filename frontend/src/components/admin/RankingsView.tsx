"use client";

import { TrendingUp, Medal, Award, Trophy } from "lucide-react";
import { RankingItem } from "@/services/admin.service";

interface RankingsViewProps {
  rankings: RankingItem[];
}

export default function RankingsView({ rankings }: RankingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Ranking Global de Candidatos</h2>
        </div>
        <p className="text-purple-100">
          Los mejores candidatos según el análisis de IA del sistema
        </p>
      </div>

      {/* Podio - Top 3 */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Segundo lugar */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-gray-400 order-2 md:order-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Medal className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-4xl font-bold text-gray-400 mb-2">2°</span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {rankings[1].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankings[1].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankings[1].empresa}</p>
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-gray-600">
                  {rankings[1].puntaje.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Primer lugar */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-t-4 border-yellow-400 transform md:scale-105 order-1 md:order-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <span className="text-5xl font-bold text-yellow-500 mb-2">1°</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {rankings[0].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankings[0].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankings[0].empresa}</p>
              <div className="bg-yellow-100 px-6 py-3 rounded-full">
                <span className="text-3xl font-bold text-yellow-600">
                  {rankings[0].puntaje.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Tercer lugar */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-400 order-3">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-orange-400" />
              </div>
              <span className="text-4xl font-bold text-orange-400 mb-2">3°</span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {rankings[2].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankings[2].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankings[2].empresa}</p>
              <div className="bg-orange-100 px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-orange-600">
                  {rankings[2].puntaje.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla completa de rankings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Ranking Completo
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posición
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay datos de ranking disponibles
                  </td>
                </tr>
              ) : (
                rankings.map((rank, index) => (
                  <tr
                    key={rank.postulanteId}
                    className={`${
                      index < 3 ? "bg-purple-50" : ""
                    } hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-lg ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-400"
                              : index === 2
                              ? "text-orange-400"
                              : "text-gray-900"
                          }`}
                        >
                          {index + 1}°
                        </span>
                        {index < 3 && (
                          <>
                            {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                            {index === 2 && <Award className="w-5 h-5 text-orange-400" />}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {rank.nombrePostulante}
                      </div>
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
                      <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full ${
                          index < 3
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
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
