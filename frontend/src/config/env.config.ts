/**
 * Configuración centralizada de variables de entorno
 * Facilita el debugging y validación de variables
 */

export const ENV_CONFIG = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  
  // Auth Configuration
  JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET || "dev-secret",
  
  // Environment
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  
  // Feature Flags (opcional para habilitar/deshabilitar features)
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_DEBUG_LOGS: process.env.NEXT_PUBLIC_DEBUG_LOGS === "true",
} as const;

/**
 * Validación de variables de entorno requeridas en producción
 */
export function validateEnvConfig() {
  if (ENV_CONFIG.IS_PRODUCTION) {
    const requiredVars = {
      NEXT_PUBLIC_API_URL: ENV_CONFIG.API_URL,
    };

    const missing = Object.entries(requiredVars)
      .filter(([_, value]) => !value || value === "http://localhost:3000")
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error(
        `⚠️ Variables de entorno faltantes en producción: ${missing.join(", ")}`
      );
    }
  }
}

// Auto-validar en producción
if (typeof window !== "undefined") {
  validateEnvConfig();
}
