/**
 * Hook para manejar filtros de búsqueda de cargos con sincronización de URL
 * Permite compartir búsquedas mediante URL y persistir filtros en navegación
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FiltrosCargo, Cargo, PaginationMeta } from "@/types";
import { cargoService } from "@/services/cargo.service";

// Valores por defecto para los filtros
export const FILTROS_DEFAULT: FiltrosCargo = {
  busqueda: "",
  ubicacion: "",
  tipoContrato: "",
  modalidad: "",
  estado: "",
  empresa: "",
  salarioMin: null,
  salarioMax: null,
  page: 1,
  limit: 12,
  sortBy: "fechaPublicacion",
  sortOrder: "desc",
};

// Mapeo de rangos de salario predefinidos
export const RANGOS_SALARIO = [
  { value: "", label: "Cualquier salario", min: null, max: null },
  { value: "0-500000", label: "Hasta $500.000", min: 0, max: 500000 },
  { value: "500000-1000000", label: "$500.000 - $1.000.000", min: 500000, max: 1000000 },
  { value: "1000000-1500000", label: "$1.000.000 - $1.500.000", min: 1000000, max: 1500000 },
  { value: "1500000-2000000", label: "$1.500.000 - $2.000.000", min: 1500000, max: 2000000 },
  { value: "2000000+", label: "Más de $2.000.000", min: 2000000, max: null },
];

interface UseCargoFiltersOptions {
  /** Si debe cargar los datos automáticamente */
  autoLoad?: boolean;
  /** Límite de elementos por página */
  defaultLimit?: number;
}

interface UseCargoFiltersReturn {
  /** Lista de cargos filtrados */
  cargos: Cargo[];
  /** Metadatos de paginación */
  pagination: PaginationMeta | null;
  /** Filtros actuales */
  filtros: FiltrosCargo;
  /** Estado de carga */
  loading: boolean;
  /** Error si ocurrió alguno */
  error: string | null;
  /** Rango de salario seleccionado (para UI) */
  rangoSalario: string;
  /** Cantidad de filtros activos */
  filtrosActivos: number;
  /** Actualizar un filtro específico */
  setFiltro: <K extends keyof FiltrosCargo>(key: K, value: FiltrosCargo[K]) => void;
  /** Actualizar múltiples filtros */
  setFiltros: (newFiltros: Partial<FiltrosCargo>) => void;
  /** Cambiar rango de salario */
  setRangoSalario: (value: string) => void;
  /** Cambiar página */
  setPage: (page: number) => void;
  /** Limpiar todos los filtros */
  limpiarFiltros: () => void;
  /** Recargar datos manualmente */
  refresh: () => Promise<void>;
}

/**
 * Parsea los searchParams de la URL a filtros
 */
function parseSearchParamsToFiltros(searchParams: URLSearchParams): FiltrosCargo {
  const filtros: FiltrosCargo = { ...FILTROS_DEFAULT };

  const busqueda = searchParams.get("busqueda");
  if (busqueda) filtros.busqueda = busqueda;

  const ubicacion = searchParams.get("ubicacion");
  if (ubicacion) filtros.ubicacion = ubicacion;

  const tipoContrato = searchParams.get("tipoContrato");
  if (tipoContrato) filtros.tipoContrato = tipoContrato as FiltrosCargo["tipoContrato"];

  const modalidad = searchParams.get("modalidad");
  if (modalidad) filtros.modalidad = modalidad as FiltrosCargo["modalidad"];

  const estado = searchParams.get("estado");
  if (estado) filtros.estado = estado as FiltrosCargo["estado"];

  const empresa = searchParams.get("empresa");
  if (empresa) filtros.empresa = empresa;

  const salarioMin = searchParams.get("salarioMin");
  if (salarioMin) filtros.salarioMin = parseInt(salarioMin, 10);

  const salarioMax = searchParams.get("salarioMax");
  if (salarioMax) filtros.salarioMax = parseInt(salarioMax, 10);

  const page = searchParams.get("page");
  if (page) filtros.page = Math.max(1, parseInt(page, 10));

  const limit = searchParams.get("limit");
  if (limit) filtros.limit = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const sortBy = searchParams.get("sortBy");
  if (sortBy) filtros.sortBy = sortBy;

  const sortOrder = searchParams.get("sortOrder");
  if (sortOrder === "asc" || sortOrder === "desc") filtros.sortOrder = sortOrder;

  return filtros;
}

/**
 * Convierte filtros a query string para la URL
 */
function filtrosToSearchParams(filtros: FiltrosCargo): URLSearchParams {
  const params = new URLSearchParams();

  // Solo agregar parámetros que difieran del default
  if (filtros.busqueda && filtros.busqueda !== FILTROS_DEFAULT.busqueda) {
    params.set("busqueda", filtros.busqueda);
  }
  if (filtros.ubicacion && filtros.ubicacion !== FILTROS_DEFAULT.ubicacion) {
    params.set("ubicacion", filtros.ubicacion);
  }
  if (filtros.tipoContrato && filtros.tipoContrato !== FILTROS_DEFAULT.tipoContrato) {
    params.set("tipoContrato", filtros.tipoContrato);
  }
  if (filtros.modalidad && filtros.modalidad !== FILTROS_DEFAULT.modalidad) {
    params.set("modalidad", filtros.modalidad);
  }
  if (filtros.estado && filtros.estado !== FILTROS_DEFAULT.estado) {
    params.set("estado", filtros.estado);
  }
  if (filtros.empresa && filtros.empresa !== FILTROS_DEFAULT.empresa) {
    params.set("empresa", filtros.empresa);
  }
  if (filtros.salarioMin !== null && filtros.salarioMin !== undefined && filtros.salarioMin !== FILTROS_DEFAULT.salarioMin) {
    params.set("salarioMin", filtros.salarioMin.toString());
  }
  if (filtros.salarioMax !== null && filtros.salarioMax !== undefined && filtros.salarioMax !== FILTROS_DEFAULT.salarioMax) {
    params.set("salarioMax", filtros.salarioMax.toString());
  }
  if (filtros.page && filtros.page !== FILTROS_DEFAULT.page) {
    params.set("page", filtros.page.toString());
  }
  if (filtros.sortBy && filtros.sortBy !== FILTROS_DEFAULT.sortBy) {
    params.set("sortBy", filtros.sortBy);
  }
  if (filtros.sortOrder && filtros.sortOrder !== FILTROS_DEFAULT.sortOrder) {
    params.set("sortOrder", filtros.sortOrder);
  }

  return params;
}

/**
 * Determina el rango de salario seleccionado basado en los valores min/max
 */
function getRangoSalarioFromFiltros(salarioMin: number | null, salarioMax: number | null): string {
  for (const rango of RANGOS_SALARIO) {
    if (rango.min === salarioMin && rango.max === salarioMax) {
      return rango.value;
    }
  }
  return "";
}

export function useCargoFilters(options: UseCargoFiltersOptions = {}): UseCargoFiltersReturn {
  const { autoLoad = true, defaultLimit = 12 } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado interno
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parsear filtros desde URL
  const filtros = useMemo(() => {
    const parsed = parseSearchParamsToFiltros(searchParams);
    if (!parsed.limit) parsed.limit = defaultLimit;
    return parsed;
  }, [searchParams, defaultLimit]);

  // Calcular rango de salario para UI
  const rangoSalario = useMemo(
    () => getRangoSalarioFromFiltros(filtros.salarioMin ?? null, filtros.salarioMax ?? null),
    [filtros.salarioMin, filtros.salarioMax]
  );

  // Contar filtros activos (excluyendo página y ordenamiento)
  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtros.busqueda) count++;
    if (filtros.ubicacion) count++;
    if (filtros.tipoContrato) count++;
    if (filtros.modalidad) count++;
    if (filtros.estado) count++;
    if (filtros.empresa) count++;
    if (filtros.salarioMin !== null || filtros.salarioMax !== null) count++;
    return count;
  }, [filtros]);

  /**
   * Actualizar URL con nuevos filtros
   */
  const updateURL = useCallback(
    (newFiltros: FiltrosCargo) => {
      const params = filtrosToSearchParams(newFiltros);
      const queryString = params.toString();
      const newURL = queryString ? `${pathname}?${queryString}` : pathname;
      
      // Usar replace para no crear entrada en historial por cada cambio de filtro
      router.replace(newURL, { scroll: false });
    },
    [pathname, router]
  );

  /**
   * Cargar cargos desde el servidor
   */
  const fetchCargos = useCallback(async (currentFiltros: FiltrosCargo) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cargoService.getCargosWithFilters(currentFiltros);
      setCargos(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      console.error("Error al cargar cargos:", err);
      setError(err.message || "Error al cargar las vacantes");
      setCargos([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar un filtro específico
   */
  const setFiltro = useCallback(
    <K extends keyof FiltrosCargo>(key: K, value: FiltrosCargo[K]) => {
      const newFiltros = {
        ...filtros,
        [key]: value,
        // Resetear página al cambiar cualquier filtro (excepto página)
        ...(key !== "page" ? { page: 1 } : {}),
      };
      updateURL(newFiltros);
    },
    [filtros, updateURL]
  );

  /**
   * Actualizar múltiples filtros
   */
  const setFiltros = useCallback(
    (newFiltros: Partial<FiltrosCargo>) => {
      const updated = {
        ...filtros,
        ...newFiltros,
        // Resetear página si se cambian filtros (excepto página)
        ...(!("page" in newFiltros) ? { page: 1 } : {}),
      };
      updateURL(updated);
    },
    [filtros, updateURL]
  );

  /**
   * Cambiar rango de salario
   */
  const setRangoSalario = useCallback(
    (value: string) => {
      const rango = RANGOS_SALARIO.find((r) => r.value === value);
      if (rango) {
        setFiltros({
          salarioMin: rango.min,
          salarioMax: rango.max,
        });
      }
    },
    [setFiltros]
  );

  /**
   * Cambiar página
   */
  const setPage = useCallback(
    (page: number) => {
      setFiltro("page", page);
    },
    [setFiltro]
  );

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = useCallback(() => {
    updateURL({
      ...FILTROS_DEFAULT,
      limit: defaultLimit,
    });
  }, [updateURL, defaultLimit]);

  /**
   * Recargar datos manualmente
   */
  const refresh = useCallback(async () => {
    await fetchCargos(filtros);
  }, [fetchCargos, filtros]);

  // Efecto para cargar datos cuando cambian los filtros
  useEffect(() => {
    if (autoLoad) {
      fetchCargos(filtros);
    }
    setIsInitialized(true);
  }, [filtros, autoLoad, fetchCargos]);

  return {
    cargos,
    pagination,
    filtros,
    loading,
    error,
    rangoSalario,
    filtrosActivos,
    setFiltro,
    setFiltros,
    setRangoSalario,
    setPage,
    limpiarFiltros,
    refresh,
  };
}

export default useCargoFilters;
