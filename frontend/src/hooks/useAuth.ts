/**
 * Hook de Autenticación
 */

"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { authService } from "@/services/auth.service";
import { LoginCredentials, UserType } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login de empresa
   */
  const loginEmpresa = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.loginEmpresa(credentials);
        authService.saveAuth(response.access_token, "empresa");
        router.push("/empresa/dashboard");
        return true;
      } catch (err: any) {
        setError(err.message || "Error al iniciar sesión");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Login de postulante
   */
  const loginPostulante = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.loginPostulante(credentials);
        authService.saveAuth(response.access_token, "postulante");
        router.push("/postulante/portal");
        return true;
      } catch (err: any) {
        setError(err.message || "Error al iniciar sesión");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout
   */
  const logout = useCallback(() => {
    authService.logout();
    router.push("/login");
  }, [router]);

  /**
   * Verificar si está autenticado
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  /**
   * Obtener tipo de usuario
   */
  const getUserType = useCallback((): UserType | null => {
    return authService.getUserType();
  }, []);

  return {
    loading,
    error,
    loginEmpresa,
    loginPostulante,
    logout,
    isAuthenticated,
    getUserType,
  };
}
