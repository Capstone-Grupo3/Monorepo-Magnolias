/**
 * Hook para el portal del candidato
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { postulanteService } from "@/services/postulante.service";
import { cargoService } from "@/services/cargo.service";
import { postulacionService } from "@/services/postulacion.service";
import { authService } from "@/services/auth.service";
import { Postulante, Cargo, Postulacion } from "@/types";

export function usePostulantePortal() {
  const router = useRouter();
  const [postulante, setPostulante] = useState<Postulante | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar datos del postulante
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
      const postulanteId = payload.sub;

      console.log("🔍 Cargando datos para postulante ID:", postulanteId);

      // Cargar perfil
      const perfilData =
        await postulanteService.getPostulanteProfile(postulanteId);
      console.log("👤 Perfil postulante:", perfilData);
      setPostulante(perfilData);

      // Cargar cargos activos
      const cargosData = await cargoService.getCargos();
      console.log("💼 Cargos disponibles:", cargosData.length);
      setCargos(cargosData);

      // Cargar postulaciones del postulante
      const postulacionesData =
        await postulacionService.getPostulacionesByPostulante(postulanteId);
      console.log("📋 Postulaciones del postulante:", postulacionesData.length);
      setPostulaciones(postulacionesData);
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
   * Crear postulación con CV adjunto
   */
  const crearPostulacion = useCallback(
    async (
      cargoId: number,
      respuestas: Record<string, string>,
      cvFile?: File
    ) => {
      try {
        const data = {
          cargoId,
          respuestasJson: respuestas,
          cvFile,
        };

        await postulacionService.createPostulacion(data);
        
        // Recargar postulaciones después de crear
        await refresh();
        
        return { success: true };
      } catch (err: any) {
        console.error("❌ Error al crear postulación:", err);
        throw err;
      }
    },
    [refresh]
  );

  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    authService.logout();
    router.push("/login");
  }, [router]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    postulante,
    cargos,
    postulaciones,
    loading,
    error,
    refresh,
    crearPostulacion,
    logout,
  };
}
