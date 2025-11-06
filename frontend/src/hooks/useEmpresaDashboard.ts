/**
 * Hook para el dashboard de la empresa
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { empresaService } from "@/services/empresa.service";
import { cargoService } from "@/services/cargo.service";
import { postulacionService } from "@/services/postulacion.service";
import { authService } from "@/services/auth.service";
import { Empresa, CargoDetalle, PostulacionDetalle } from "@/types";

export function useEmpresaDashboard() {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargos, setCargos] = useState<CargoDetalle[]>([]);
  const [postulaciones, setPostulaciones] = useState<PostulacionDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar datos de la empresa
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar autenticación
      const token = authService.getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      // Decodificar token para obtener ID
      const payload = JSON.parse(atob(token.split(".")[1]));
      const empresaId = payload.sub;

      console.log("🔍 Cargando datos para empresa ID:", empresaId);

      // Cargar perfil
      const perfilData = await empresaService.getEmpresaProfile(empresaId);
      console.log("🏢 Perfil empresa:", perfilData);
      setEmpresa(perfilData);

      // Cargar cargos de la empresa
      const cargosData = await cargoService.getCargosByEmpresa(empresaId);
      console.log("💼 Cargos de la empresa:", cargosData.length);
      setCargos(cargosData);

      // Cargar todas las postulaciones de la empresa
      try {
        const postulacionesData = await postulacionService.getPostulacionesByEmpresa(empresaId);
        console.log("📋 Postulaciones de la empresa:", postulacionesData.length);
        setPostulaciones(postulacionesData);
      } catch (postErr: any) {
        // Si el endpoint no existe aún, simplemente no cargar postulaciones
        console.warn("⚠️ No se pudieron cargar postulaciones de empresa:", postErr.message);
        setPostulaciones([]);
      }
    } catch (err: any) {
      console.error("❌ Error cargando datos:", err);
      setError(err.message || "Error al cargar los datos");

      // Si es error de autenticación, redirigir a login
      if (err.statusCode === 401) {
        authService.logout();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Recargar datos
   */
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    authService.logout();
    router.push("/login");
  }, [router]);

  /**
   * Eliminar cargo
   */
  const deleteCargo = useCallback(async (cargoId: number) => {
    try {
      await cargoService.deleteCargo(cargoId);
      // Actualizar lista de cargos
      setCargos((prev) => prev.filter((c) => c.id !== cargoId));
      return true;
    } catch (err: any) {
      console.error("❌ Error eliminando cargo:", err);
      setError(err.message || "Error al eliminar cargo");
      return false;
    }
  }, []);

  /**
   * Activar/Desactivar cargo
   */
  const toggleCargoStatus = useCallback(
    async (cargoId: number, activo: boolean) => {
      try {
        const updated = await cargoService.toggleCargoStatus(
          cargoId,
          activo
        );
        // Actualizar el cargo en la lista
        setCargos((prev) =>
          prev.map((c) => (c.id === cargoId ? { ...c, activo } : c))
        );
        return true;
      } catch (err: any) {
        console.error("❌ Error actualizando estado de cargo:", err);
        setError(err.message || "Error al actualizar cargo");
        return false;
      }
    },
    []
  );

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    empresa,
    cargos,
    postulaciones,
    loading,
    error,
    refresh,
    logout,
    deleteCargo,
    toggleCargoStatus,
  };
}
