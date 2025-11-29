"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, X, MapPin, Briefcase, Clock, DollarSign, Building2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Cargo } from "@/types";

// Tipos para los filtros
export interface FiltrosCargo {
  busqueda: string;
  ubicacion: string;
  tipoContrato: string;
  modalidad: string;
  salarioMin: number | null;
  salarioMax: number | null;
  empresa: string;
}

export const filtrosIniciales: FiltrosCargo = {
  busqueda: "",
  ubicacion: "",
  tipoContrato: "",
  modalidad: "",
  salarioMin: null,
  salarioMax: null,
  empresa: "",
};

// Opciones de filtros
export const tiposContrato = [
  { value: "", label: "Todos los tipos" },
  { value: "FULL_TIME", label: "Tiempo Completo" },
  { value: "PART_TIME", label: "Medio Tiempo" },
  { value: "CONTRACTOR", label: "Contratista" },
  { value: "TEMPORARY", label: "Temporal" },
  { value: "INTERNSHIP", label: "Práctica" },
];

export const modalidades = [
  { value: "", label: "Todas las modalidades" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTO", label: "Remoto" },
  { value: "HIBRIDO", label: "Híbrido" },
];

export const rangosSalario = [
  { value: "", label: "Cualquier salario", min: null, max: null },
  { value: "0-500000", label: "Hasta $500.000", min: 0, max: 500000 },
  { value: "500000-1000000", label: "$500.000 - $1.000.000", min: 500000, max: 1000000 },
  { value: "1000000-1500000", label: "$1.000.000 - $1.500.000", min: 1000000, max: 1500000 },
  { value: "1500000-2000000", label: "$1.500.000 - $2.000.000", min: 1500000, max: 2000000 },
  { value: "2000000+", label: "Más de $2.000.000", min: 2000000, max: null },
];

interface BuscadorCargosProps {
  cargos: Cargo[];
  onResultados: (cargos: Cargo[]) => void;
}

export default function BuscadorCargos({ cargos, onResultados }: BuscadorCargosProps) {
  const [filtros, setFiltros] = useState<FiltrosCargo>(filtrosIniciales);
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [rangoSalarioSeleccionado, setRangoSalarioSeleccionado] = useState("");

  // Obtener ubicaciones únicas de los cargos
  const ubicacionesUnicas = useMemo(() => {
    const ubicaciones = new Set(cargos.map(c => c.ubicacion).filter(Boolean));
    return Array.from(ubicaciones).sort();
  }, [cargos]);

  // Obtener empresas únicas de los cargos
  const empresasUnicas = useMemo(() => {
    const empresas = new Set(cargos.map(c => c.empresa.nombre).filter(Boolean));
    return Array.from(empresas).sort();
  }, [cargos]);

  // Filtrar cargos
  const cargosFiltrados = useMemo(() => {
    return cargos.filter((cargo) => {
      // Filtro de búsqueda por texto (título, descripción, empresa)
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const coincide =
          cargo.titulo.toLowerCase().includes(busquedaLower) ||
          cargo.descripcion?.toLowerCase().includes(busquedaLower) ||
          cargo.empresa.nombre.toLowerCase().includes(busquedaLower) ||
          cargo.ubicacion?.toLowerCase().includes(busquedaLower);
        if (!coincide) return false;
      }

      // Filtro de ubicación
      if (filtros.ubicacion && cargo.ubicacion !== filtros.ubicacion) {
        return false;
      }

      // Filtro de tipo de contrato
      if (filtros.tipoContrato && cargo.tipoContrato !== filtros.tipoContrato) {
        return false;
      }

      // Filtro de modalidad
      if (filtros.modalidad && cargo.modalidad !== filtros.modalidad) {
        return false;
      }

      // Filtro de empresa
      if (filtros.empresa && cargo.empresa.nombre !== filtros.empresa) {
        return false;
      }

      // Filtro de salario mínimo
      if (filtros.salarioMin !== null && cargo.salarioEstimado) {
        if (cargo.salarioEstimado < filtros.salarioMin) {
          return false;
        }
      }

      // Filtro de salario máximo
      if (filtros.salarioMax !== null && cargo.salarioEstimado) {
        if (cargo.salarioEstimado > filtros.salarioMax) {
          return false;
        }
      }

      return true;
    });
  }, [cargos, filtros]);

  // Notificar cambios en los resultados
  useEffect(() => {
    onResultados(cargosFiltrados);
  }, [cargosFiltrados, onResultados]);

  // Handlers
  const handleBusquedaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
  }, []);

  const handleFiltroChange = useCallback((campo: keyof FiltrosCargo, valor: string | number | null) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleRangoSalarioChange = useCallback((valor: string) => {
    setRangoSalarioSeleccionado(valor);
    const rango = rangosSalario.find(r => r.value === valor);
    if (rango) {
      setFiltros(prev => ({
        ...prev,
        salarioMin: rango.min,
        salarioMax: rango.max,
      }));
    }
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
    setRangoSalarioSeleccionado("");
  }, []);

  // Contar filtros activos
  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtros.ubicacion) count++;
    if (filtros.tipoContrato) count++;
    if (filtros.modalidad) count++;
    if (filtros.empresa) count++;
    if (filtros.salarioMin !== null || filtros.salarioMax !== null) count++;
    return count;
  }, [filtros]);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Campo de búsqueda */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cargo, empresa o palabras clave..."
              value={filtros.busqueda}
              onChange={handleBusquedaChange}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {filtros.busqueda && (
              <button
                onClick={() => handleFiltroChange("busqueda", "")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Filtros rápidos en desktop */}
          <div className="hidden lg:flex gap-3">
            {/* Ubicación */}
            <div className="relative">
              <select
                value={filtros.ubicacion}
                onChange={(e) => handleFiltroChange("ubicacion", e.target.value)}
                className="appearance-none pl-10 pr-10 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white cursor-pointer min-w-[180px]"
              >
                <option value="">Ubicación</option>
                {ubicacionesUnicas.map((ubicacion) => (
                  <option key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Tipo de contrato */}
            <div className="relative">
              <select
                value={filtros.tipoContrato}
                onChange={(e) => handleFiltroChange("tipoContrato", e.target.value)}
                className="appearance-none pl-10 pr-10 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white cursor-pointer min-w-[180px]"
              >
                {tiposContrato.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Botón de filtros avanzados */}
          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border transition-all font-medium ${
              mostrarFiltrosAvanzados || filtrosActivos > 0
                ? "bg-orange-50 border-orange-200 text-orange-600"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Filtros</span>
            {filtrosActivos > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros avanzados */}
        <AnimatePresence>
          {mostrarFiltrosAvanzados && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Ubicación (mobile) */}
                  <div className="lg:hidden">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Ubicación
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.ubicacion}
                        onChange={(e) => handleFiltroChange("ubicacion", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white"
                      >
                        <option value="">Todas las ubicaciones</option>
                        {ubicacionesUnicas.map((ubicacion) => (
                          <option key={ubicacion} value={ubicacion}>
                            {ubicacion}
                          </option>
                        ))}
                      </select>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Tipo de contrato (mobile) */}
                  <div className="lg:hidden">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Tipo de Contrato
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.tipoContrato}
                        onChange={(e) => handleFiltroChange("tipoContrato", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white"
                      >
                        {tiposContrato.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Modalidad
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.modalidad}
                        onChange={(e) => handleFiltroChange("modalidad", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white"
                      >
                        {modalidades.map((modalidad) => (
                          <option key={modalidad.value} value={modalidad.value}>
                            {modalidad.label}
                          </option>
                        ))}
                      </select>
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Rango de salario */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Rango Salarial
                    </label>
                    <div className="relative">
                      <select
                        value={rangoSalarioSeleccionado}
                        onChange={(e) => handleRangoSalarioChange(e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white"
                      >
                        {rangosSalario.map((rango) => (
                          <option key={rango.value} value={rango.value}>
                            {rango.label}
                          </option>
                        ))}
                      </select>
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Empresa
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.empresa}
                        onChange={(e) => handleFiltroChange("empresa", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-700 bg-white"
                      >
                        <option value="">Todas las empresas</option>
                        {empresasUnicas.map((empresa) => (
                          <option key={empresa} value={empresa}>
                            {empresa}
                          </option>
                        ))}
                      </select>
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                {filtrosActivos > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resumen de resultados y filtros activos */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-600">
          <span className="font-semibold text-slate-900">{cargosFiltrados.length}</span>
          {" "}cargo{cargosFiltrados.length !== 1 ? "s" : ""} encontrado{cargosFiltrados.length !== 1 ? "s" : ""}
        </span>

        {/* Tags de filtros activos */}
        {filtros.busqueda && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            Búsqueda: "{filtros.busqueda}"
            <button
              onClick={() => handleFiltroChange("busqueda", "")}
              className="hover:bg-orange-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.ubicacion && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <MapPin className="h-3.5 w-3.5" />
            {filtros.ubicacion}
            <button
              onClick={() => handleFiltroChange("ubicacion", "")}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.tipoContrato && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            {tiposContrato.find(t => t.value === filtros.tipoContrato)?.label}
            <button
              onClick={() => handleFiltroChange("tipoContrato", "")}
              className="hover:bg-green-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.modalidad && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Briefcase className="h-3.5 w-3.5" />
            {modalidades.find(m => m.value === filtros.modalidad)?.label}
            <button
              onClick={() => handleFiltroChange("modalidad", "")}
              className="hover:bg-purple-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.empresa && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            <Building2 className="h-3.5 w-3.5" />
            {filtros.empresa}
            <button
              onClick={() => handleFiltroChange("empresa", "")}
              className="hover:bg-amber-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {(filtros.salarioMin !== null || filtros.salarioMax !== null) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            <DollarSign className="h-3.5 w-3.5" />
            {rangosSalario.find(r => r.value === rangoSalarioSeleccionado)?.label}
            <button
              onClick={() => {
                handleRangoSalarioChange("");
              }}
              className="hover:bg-emerald-200 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
