"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, X, MapPin, Briefcase, Clock, DollarSign, Building2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Cargo } from "@/types";

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

export const tiposContrato = [
  { value: "", label: "Todos los tipos" },
  { value: "FULL_TIME", label: "Tiempo Completo" },
  { value: "PART_TIME", label: "Medio Tiempo" },
  { value: "PRACTICA", label: "Práctica" },
  { value: "FREELANCE", label: "Freelance" },
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

  const ubicacionesUnicas = useMemo(() => {
    const ubicaciones = new Set(cargos.map(c => c.ubicacion).filter(Boolean));
    return Array.from(ubicaciones).sort();
  }, [cargos]);

  const empresasUnicas = useMemo(() => {
    const empresas = new Set(cargos.map(c => c.empresa.nombre).filter(Boolean));
    return Array.from(empresas).sort();
  }, [cargos]);

  const cargosFiltrados = useMemo(() => {
    return cargos.filter((cargo) => {
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const coincide =
          cargo.titulo.toLowerCase().includes(busquedaLower) ||
          cargo.descripcion?.toLowerCase().includes(busquedaLower) ||
          cargo.empresa.nombre.toLowerCase().includes(busquedaLower) ||
          cargo.ubicacion?.toLowerCase().includes(busquedaLower);
        if (!coincide) return false;
      }

      if (filtros.ubicacion && cargo.ubicacion !== filtros.ubicacion) return false;
      if (filtros.tipoContrato && cargo.tipoContrato !== filtros.tipoContrato) return false;
      if (filtros.modalidad && cargo.modalidad !== filtros.modalidad) return false;
      if (filtros.empresa && cargo.empresa.nombre !== filtros.empresa) return false;

      if (filtros.salarioMin !== null && cargo.salarioEstimado) {
        if (cargo.salarioEstimado < filtros.salarioMin) return false;
      }
      if (filtros.salarioMax !== null && cargo.salarioEstimado) {
        if (cargo.salarioEstimado > filtros.salarioMax) return false;
      }

      return true;
    });
  }, [cargos, filtros]);

  useEffect(() => {
    onResultados(cargosFiltrados);
  }, [cargosFiltrados, onResultados]);

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
      <div className="surface-card rounded-2xl border border-border-subtle p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cargo, empresa o palabras clave..."
              value={filtros.busqueda}
              onChange={handleBusquedaChange}
              className="w-full pl-12 pr-4 py-3.5 border border-border-default rounded-xl bg-transparent text-primary placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            {filtros.busqueda && (
              <button
                onClick={() => handleFiltroChange("busqueda", "")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-5 w-5 text-muted hover:text-secondary" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex gap-3">
            <div className="relative">
              <select
                value={filtros.ubicacion}
                onChange={(e) => handleFiltroChange("ubicacion", e.target.value)}
                className="appearance-none pl-10 pr-10 py-3.5 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer min-w-[180px]"
              >
                <option value="">Ubicación</option>
                {ubicacionesUnicas.map((ubicacion) => (
                  <option key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filtros.tipoContrato}
                onChange={(e) => handleFiltroChange("tipoContrato", e.target.value)}
                className="appearance-none pl-10 pr-10 py-3.5 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer min-w-[180px]"
              >
                {tiposContrato.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border transition-all font-medium ${
              mostrarFiltrosAvanzados || filtrosActivos > 0
                ? "primary-soft border-primary text-primary"
                : "surface-muted border-border-default text-secondary hover:bg-surface-hover"
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Filtros</span>
            {filtrosActivos > 0 && (
              <span className="primary-bg text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosActivos}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {mostrarFiltrosAvanzados && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border-subtle">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:hidden">
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Ubicación
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.ubicacion}
                        onChange={(e) => handleFiltroChange("ubicacion", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Todas las ubicaciones</option>
                        {ubicacionesUnicas.map((ubicacion) => (
                          <option key={ubicacion} value={ubicacion}>
                            {ubicacion}
                          </option>
                        ))}
                      </select>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                    </div>
                  </div>

                  <div className="lg:hidden">
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Tipo de Contrato
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.tipoContrato}
                        onChange={(e) => handleFiltroChange("tipoContrato", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        {tiposContrato.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Modalidad
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.modalidad}
                        onChange={(e) => handleFiltroChange("modalidad", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        {modalidades.map((modalidad) => (
                          <option key={modalidad.value} value={modalidad.value}>
                            {modalidad.label}
                          </option>
                        ))}
                      </select>
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Rango Salarial
                    </label>
                    <div className="relative">
                      <select
                        value={rangoSalarioSeleccionado}
                        onChange={(e) => handleRangoSalarioChange(e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        {rangosSalario.map((rango) => (
                          <option key={rango.value} value={rango.value}>
                            {rango.label}
                          </option>
                        ))}
                      </select>
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                      Empresa
                    </label>
                    <div className="relative">
                      <select
                        value={filtros.empresa}
                        onChange={(e) => handleFiltroChange("empresa", e.target.value)}
                        className="w-full appearance-none pl-10 pr-10 py-3 border border-border-default rounded-xl bg-transparent text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Todas las empresas</option>
                        {empresasUnicas.map((empresa) => (
                          <option key={empresa} value={empresa}>
                            {empresa}
                          </option>
                        ))}
                      </select>
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>

                {filtrosActivos > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
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

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-secondary">
          <span className="font-semibold text-primary">{cargosFiltrados.length}</span>
          {" "}cargo{cargosFiltrados.length !== 1 ? "s" : ""} encontrado{cargosFiltrados.length !== 1 ? "s" : ""}
        </span>

        {filtros.busqueda && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 primary-soft text-primary rounded-full text-sm font-medium">
            Búsqueda: &quot;{filtros.busqueda}&quot;
            <button
              onClick={() => handleFiltroChange("busqueda", "")}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Quitar filtro de búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.ubicacion && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-soft text-blue rounded-full text-sm font-medium">
            <MapPin className="h-3.5 w-3.5" />
            {filtros.ubicacion}
            <button
              onClick={() => handleFiltroChange("ubicacion", "")}
              className="hover:bg-blue-soft/80 rounded-full p-0.5"
              aria-label="Quitar filtro de ubicación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.tipoContrato && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 success-soft text-success rounded-full text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            {tiposContrato.find(t => t.value === filtros.tipoContrato)?.label}
            <button
              onClick={() => handleFiltroChange("tipoContrato", "")}
              className="hover:bg-success/20 rounded-full p-0.5"
              aria-label="Quitar filtro de tipo de contrato"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.modalidad && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 primary-soft text-primary rounded-full text-sm font-medium">
            <Briefcase className="h-3.5 w-3.5" />
            {modalidades.find(m => m.value === filtros.modalidad)?.label}
            <button
              onClick={() => handleFiltroChange("modalidad", "")}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label="Quitar filtro de modalidad"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {filtros.empresa && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 warning-soft text-warning rounded-full text-sm font-medium">
            <Building2 className="h-3.5 w-3.5" />
            {filtros.empresa}
            <button
              onClick={() => handleFiltroChange("empresa", "")}
              className="hover:bg-warning/20 rounded-full p-0.5"
              aria-label="Quitar filtro de empresa"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {(filtros.salarioMin !== null || filtros.salarioMax !== null) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 success-soft text-success rounded-full text-sm font-medium">
            <DollarSign className="h-3.5 w-3.5" />
            {rangosSalario.find(r => r.value === rangoSalarioSeleccionado)?.label}
            <button
              onClick={() => handleRangoSalarioChange("")}
              className="hover:bg-success/20 rounded-full p-0.5"
              aria-label="Quitar filtro de rango salarial"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}