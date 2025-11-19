"use client";

import { useState, useEffect } from "react";
import { ReporteRanking, CandidatoRanking } from "@/types";
import {
  Trophy,
  TrendingUp,
  Users,
  Target,
  Award,
  Mail,
  Phone,
  Calendar,
  Briefcase,
} from "lucide-react";

interface VisualizacionReporteProps {
  reporte: ReporteRanking;
}

export default function VisualizacionReporte({
  reporte,
}: VisualizacionReporteProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "ranking" | "top3">(
    "resumen"
  );

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRankingBadge = (posicion: number) => {
    if (posicion === 1)
      return (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-yellow-400 to-yellow-600 text-white font-bold text-lg shadow-lg">
          🥇
        </span>
      );
    if (posicion === 2)
      return (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-gray-300 to-gray-500 text-white font-bold text-lg shadow-lg">
          🥈
        </span>
      );
    if (posicion === 3)
      return (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-orange-400 to-orange-600 text-white font-bold text-lg shadow-lg">
          🥉
        </span>
      );
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-indigo-600 text-white font-bold">
        {posicion}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header del Reporte */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 text-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              📊 Reporte de Ranking de Candidatos
            </h2>
            <p className="text-purple-100 text-lg">{reporte.cargo.titulo}</p>
            <p className="text-purple-200 text-sm mt-1">
              {reporte.empresa.nombre} | Generado el {formatFecha(reporte.fechaGeneracion)}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-sm opacity-90">ID Reporte</div>
              <div className="font-mono text-xs">
                {reporte.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Users className="w-4 h-4" />
            Total Postulantes
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {reporte.estadisticas.totalPostulantes}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Score Promedio
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {reporte.estadisticas.promedioScore}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Candidatos Top
          </div>
          <div className="text-3xl font-bold text-green-600">
            {reporte.estadisticas.candidatosTop}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
            <Target className="w-4 h-4" />
            Completitud
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {reporte.estadisticas.tasaCompletitud}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveTab("resumen")}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            activeTab === "resumen"
              ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
              : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
          }`}
        >
          ⭐ Resumen Ejecutivo
        </button>
        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            activeTab === "ranking"
              ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
              : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
          }`}
        >
          🏅 Ranking Completo
        </button>
        <button
          onClick={() => setActiveTab("top3")}
          className={`flex-1 px-6 py-4 font-semibold transition-colors ${
            activeTab === "top3"
              ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
              : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
          }`}
        >
          🔍 Top 3 Detallado
        </button>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Tab: Resumen Ejecutivo */}
        {activeTab === "resumen" && (
          <div className="space-y-6">
            {/* Mejor Candidato */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-8 h-8" />
                  Mejor Candidato
                </h3>
                <div className="text-6xl font-bold opacity-90">
                  {reporte.resumenEjecutivo.mejorCandidato.puntajeIa}
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {reporte.resumenEjecutivo.mejorCandidato.nombre}
              </h2>
              <p className="text-purple-100 text-lg">
                Posición #{reporte.resumenEjecutivo.mejorCandidato.posicion}
              </p>
            </div>

            {/* Razón Principal */}
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-600">
              <h4 className="font-semibold text-purple-900 mb-3">
                Razón Principal
              </h4>
              <p className="text-gray-700">
                {reporte.resumenEjecutivo.razonPrincipal}
              </p>
            </div>

            {/* Razones Secundarias */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-purple-900 mb-4">
                Razones Secundarias
              </h4>
              <ul className="space-y-3">
                {reporte.resumenEjecutivo.razonesSecundarias.map((razon, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{razon}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendación Final */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                💡 Recomendación Final
              </h4>
              <p className="text-gray-800 leading-relaxed">
                {reporte.resumenEjecutivo.recomendacionFinal}
              </p>
            </div>

            {/* Recomendaciones de IA */}
            {reporte.recomendacionesIA.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  🤖 Recomendaciones de IA
                </h4>
                <ul className="space-y-2">
                  {reporte.recomendacionesIA.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-700 bg-purple-50 p-3 rounded-lg"
                    >
                      <span className="text-purple-600">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab: Ranking Completo */}
        {activeTab === "ranking" && (
          <div className="space-y-3">
            {reporte.ranking.map((candidato) => (
              <div
                key={candidato.id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="shrink-0">
                  {getRankingBadge(candidato.posicion)}
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {candidato.nombre}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {candidato.correo}
                    </span>
                    {candidato.experienciaAnios && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {candidato.experienciaAnios} años
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {candidato.puntajeIa}
                  </div>
                  <div className="text-xs text-gray-500">Puntaje IA</div>
                  {candidato.matchingPorcentaje !== undefined && (
                    <div className="mt-1 text-sm text-indigo-600">
                      {candidato.matchingPorcentaje}% matching
                    </div>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="w-32">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-indigo-600 transition-all"
                      style={{ width: `${candidato.puntajeIa}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Top 3 Detallado */}
        {activeTab === "top3" && (
          <div className="space-y-6">
            {reporte.top3Detallado.map((candidato, index) => (
              <div
                key={candidato.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getRankingBadge(candidato.posicion)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {candidato.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">{candidato.correo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-purple-600">
                      {candidato.puntajeIa}
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>

                {/* Información de contacto y experiencia */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {candidato.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-purple-600" />
                      {candidato.telefono}
                    </div>
                  )}
                  {candidato.experienciaAnios !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      {candidato.experienciaAnios} años de experiencia
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Target className="w-4 h-4 text-purple-600" />
                    Matching: {candidato.matchingPorcentaje || 0}%
                  </div>
                  {candidato.fitCultural !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-purple-600" />
                      Fit Cultural: {candidato.fitCultural}%
                    </div>
                  )}
                </div>

                {/* Fortalezas */}
                {candidato.fortalezas && candidato.fortalezas.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-purple-900 mb-2">
                      ✅ Fortalezas
                    </h5>
                    <ul className="space-y-1">
                      {candidato.fortalezas.map((fortaleza, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {fortaleza}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Habilidades Clave */}
                {candidato.habilidadesClave && candidato.habilidadesClave.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-purple-900 mb-2">
                      🎯 Habilidades Clave
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {candidato.habilidadesClave.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback de IA */}
                {candidato.feedbackIa && typeof candidato.feedbackIa === "string" && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      🤖 Feedback de IA
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {candidato.feedbackIa.substring(0, 400)}
                      {candidato.feedbackIa.length > 400 && "..."}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
