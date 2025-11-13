/**
 * Hook personalizado para el Dashboard de Administrador
 * Maneja toda la lógica de estado y datos del panel admin
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { adminService, DashboardStats, RankingItem, PostulacionStats, TopCargo } from "@/services/admin.service";

export function useAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [postulacionesStats, setPostulacionesStats] = useState<PostulacionStats[]>([]);
  const [topCargos, setTopCargos] = useState<TopCargo[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar datos del dashboard
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, rankingsData, postulacionesStatsData, topCargosData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRankings(),
        adminService.getPostulacionesStats("mes"),
        adminService.getTopCargos(5),
      ]);

      setStats(statsData);
      setRankings(rankingsData);
      setPostulacionesStats(postulacionesStatsData);
      setTopCargos(topCargosData);
    } catch (err: any) {
      console.error("Error al cargar datos del dashboard:", err);
      
      // Extraer mensaje de error apropiado
      const errorMessage = 
        err?.message || 
        err?.error || 
        (typeof err === 'string' ? err : 'Error al cargar datos del dashboard');
      
      setError(errorMessage);
      
      // Si hay error de autenticación, redirigir al login
      if (
        err?.statusCode === 401 || 
        errorMessage?.includes("Token") || 
        errorMessage?.includes("Acceso denegado") ||
        errorMessage?.includes("No autorizado")
      ) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Cargar datos al montar el componente
   */
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /**
   * Logout del administrador
   */
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/admin/login");
  }, [router]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    rankings,
    postulacionesStats,
    topCargos,
    loading,
    error,
    logout,
    refresh,
  };
}
