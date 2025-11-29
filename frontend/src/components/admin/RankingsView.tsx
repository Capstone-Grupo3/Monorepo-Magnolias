"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingUp, Medal, Award, Trophy, Download, Building2, Check, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RankingItem } from "@/services/admin.service";

interface RankingsViewProps {
  rankings: RankingItem[];
}

export default function RankingsView({ rankings }: RankingsViewProps) {
  // Estados para filtro de empresas y exportación
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<Set<string>>(new Set());
  const [mostrarSelectorEmpresas, setMostrarSelectorEmpresas] = useState(false);
  const [exportando, setExportando] = useState(false);

  // Obtener lista única de empresas
  const empresasUnicas = useMemo(() => {
    const empresas = new Set(rankings.map(r => r.empresa));
    return Array.from(empresas).sort();
  }, [rankings]);

  // Rankings filtrados por empresas seleccionadas
  const rankingsFiltrados = useMemo(() => {
    if (empresasSeleccionadas.size === 0) {
      return rankings;
    }
    return rankings.filter(r => empresasSeleccionadas.has(r.empresa));
  }, [rankings, empresasSeleccionadas]);

  // Handlers
  const toggleEmpresa = useCallback((empresa: string) => {
    setEmpresasSeleccionadas(prev => {
      const nuevas = new Set(prev);
      if (nuevas.has(empresa)) {
        nuevas.delete(empresa);
      } else {
        nuevas.add(empresa);
      }
      return nuevas;
    });
  }, []);

  const seleccionarTodas = useCallback(() => {
    setEmpresasSeleccionadas(new Set(empresasUnicas));
  }, [empresasUnicas]);

  const deseleccionarTodas = useCallback(() => {
    setEmpresasSeleccionadas(new Set());
  }, []);

  // Exportar a CSV
  const exportarCSV = useCallback(() => {
    setExportando(true);
    
    const datosExportar = empresasSeleccionadas.size > 0 ? rankingsFiltrados : rankings;
    
    // Headers del CSV
    const headers = ["Posición", "Candidato", "Correo", "Cargo", "Empresa", "Puntaje"];
    
    // Filas de datos
    const filas = datosExportar.map((rank, index) => [
      index + 1,
      rank.nombrePostulante,
      rank.correo,
      rank.cargo,
      rank.empresa,
      rank.puntaje.toFixed(2)
    ]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(","),
      ...filas.map(fila => fila.map(celda => `"${celda}"`).join(","))
    ].join("\n");
    
    // Crear y descargar archivo
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const empresasNombre = empresasSeleccionadas.size > 0 
      ? `_${Array.from(empresasSeleccionadas).join("_").substring(0, 30)}`
      : "_todas";
    
    link.setAttribute("href", url);
    link.setAttribute("download", `ranking_candidatos${empresasNombre}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setExportando(false), 1000);
  }, [rankings, rankingsFiltrados, empresasSeleccionadas]);

  // Exportar a Excel (formato XLSX básico usando CSV con extensión .xls)
  const exportarExcel = useCallback(() => {
    setExportando(true);
    
    const datosExportar = empresasSeleccionadas.size > 0 ? rankingsFiltrados : rankings;
    
    // Crear tabla HTML para Excel
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
      <table border="1">
        <thead>
          <tr style="background-color: #7c3aed; color: white; font-weight: bold;">
            <th>Posición</th>
            <th>Candidato</th>
            <th>Correo</th>
            <th>Cargo</th>
            <th>Empresa</th>
            <th>Puntaje</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    datosExportar.forEach((rank, index) => {
      const bgColor = index < 3 ? "#f3e8ff" : (index % 2 === 0 ? "#ffffff" : "#f9fafb");
      html += `
        <tr style="background-color: ${bgColor};">
          <td style="text-align: center; font-weight: bold;">${index + 1}°</td>
          <td>${rank.nombrePostulante}</td>
          <td>${rank.correo}</td>
          <td>${rank.cargo}</td>
          <td>${rank.empresa}</td>
          <td style="text-align: center; font-weight: bold;">${rank.puntaje.toFixed(2)}</td>
        </tr>
      `;
    });
    
    html += "</tbody></table></body></html>";
    
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const empresasNombre = empresasSeleccionadas.size > 0 
      ? `_${Array.from(empresasSeleccionadas).join("_").substring(0, 30)}`
      : "_todas";
    
    link.setAttribute("href", url);
    link.setAttribute("download", `ranking_candidatos${empresasNombre}_${new Date().toISOString().split("T")[0]}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setExportando(false), 1000);
  }, [rankings, rankingsFiltrados, empresasSeleccionadas]);

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Ranking Global de Candidatos</h2>
            </div>
            <p className="text-purple-100">
              Los mejores candidatos según el análisis de IA del sistema
            </p>
          </div>
          
          {/* Contador de filtros */}
          {empresasSeleccionadas.size > 0 && (
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                Filtrando {empresasSeleccionadas.size} empresa{empresasSeleccionadas.size !== 1 ? "s" : ""} • {rankingsFiltrados.length} candidato{rankingsFiltrados.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Filtro y Exportación */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Selector de Empresas */}
          <div className="relative">
            <button
              onClick={() => setMostrarSelectorEmpresas(!mostrarSelectorEmpresas)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                mostrarSelectorEmpresas || empresasSeleccionadas.size > 0
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="font-medium">
                {empresasSeleccionadas.size === 0 
                  ? "Seleccionar Empresas" 
                  : `${empresasSeleccionadas.size} empresa${empresasSeleccionadas.size !== 1 ? "s" : ""} seleccionada${empresasSeleccionadas.size !== 1 ? "s" : ""}`
                }
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${mostrarSelectorEmpresas ? "rotate-180" : ""}`} />
              {empresasSeleccionadas.size > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {empresasSeleccionadas.size}
                </span>
              )}
            </button>

            {/* Dropdown de empresas */}
            <AnimatePresence>
              {mostrarSelectorEmpresas && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                >
                  {/* Acciones rápidas */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex gap-2">
                    <button
                      onClick={seleccionarTodas}
                      className="flex-1 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Seleccionar todas
                    </button>
                    <button
                      onClick={deseleccionarTodas}
                      className="flex-1 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Limpiar selección
                    </button>
                  </div>

                  {/* Lista de empresas */}
                  <div className="max-h-64 overflow-y-auto p-2">
                    {empresasUnicas.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">No hay empresas disponibles</p>
                    ) : (
                      empresasUnicas.map((empresa) => (
                        <label
                          key={empresa}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              empresasSeleccionadas.has(empresa)
                                ? "bg-purple-500 border-purple-500"
                                : "border-slate-300 hover:border-purple-400"
                            }`}
                          >
                            {empresasSeleccionadas.has(empresa) && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={empresasSeleccionadas.has(empresa)}
                            onChange={() => toggleEmpresa(empresa)}
                            className="sr-only"
                          />
                          <span className="text-slate-700 font-medium">{empresa}</span>
                          <span className="ml-auto text-xs text-slate-400">
                            {rankings.filter(r => r.empresa === empresa).length} candidatos
                          </span>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => setMostrarSelectorEmpresas(false)}
                      className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botones de exportación */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">
              Exportar ranking{empresasSeleccionadas.size > 0 ? " filtrado" : ""}:
            </span>
            
            <button
              onClick={exportarCSV}
              disabled={exportando || rankingsFiltrados.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              <span>CSV</span>
            </button>
            
            <button
              onClick={exportarExcel}
              disabled={exportando || rankingsFiltrados.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Excel</span>
            </button>

            {exportando && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Exportando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags de empresas seleccionadas */}
        {empresasSeleccionadas.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(empresasSeleccionadas).map((empresa) => (
              <span
                key={empresa}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                <Building2 className="w-3.5 h-3.5" />
                {empresa}
                <button
                  onClick={() => toggleEmpresa(empresa)}
                  className="hover:bg-purple-200 rounded-full p-0.5 ml-1"
                >
                  <span className="sr-only">Eliminar</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <button
              onClick={deseleccionarTodas}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Podio - Top 3 */}
      {rankingsFiltrados.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Segundo lugar */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-gray-400 order-2 md:order-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Medal className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-4xl font-bold text-gray-400 mb-2">2°</span>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {rankingsFiltrados[1].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankingsFiltrados[1].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankingsFiltrados[1].empresa}</p>
              <div className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-gray-600">
                  {rankingsFiltrados[1].puntaje.toFixed(2)}
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
                {rankingsFiltrados[0].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankingsFiltrados[0].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankingsFiltrados[0].empresa}</p>
              <div className="bg-yellow-100 px-6 py-3 rounded-full">
                <span className="text-3xl font-bold text-yellow-600">
                  {rankingsFiltrados[0].puntaje.toFixed(2)}
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
                {rankingsFiltrados[2].nombrePostulante}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{rankingsFiltrados[2].cargo}</p>
              <p className="text-xs text-gray-500 mb-4">{rankingsFiltrados[2].empresa}</p>
              <div className="bg-orange-100 px-4 py-2 rounded-full">
                <span className="text-2xl font-bold text-orange-600">
                  {rankingsFiltrados[2].puntaje.toFixed(2)}
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
              {rankingsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {empresasSeleccionadas.size === 0 
                      ? 'Selecciona al menos una empresa para ver el ranking'
                      : 'No hay datos de ranking disponibles'}
                  </td>
                </tr>
              ) : (
                rankingsFiltrados.map((rank, index) => (
                  <tr
                    key={`${rank.postulanteId}-${rank.cargo}-${index}`}
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
