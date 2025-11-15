-- Migration: Add security validation fields
-- Esta migración agrega campos para verificación de email, OAuth y rate limiting

-- Agregar campos a la tabla empresas
ALTER TABLE empresas
  ADD COLUMN "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tokenVerificacion" VARCHAR(255),
  ADD COLUMN "tokenExpiracion" TIMESTAMP,
  ADD COLUMN "linkedinId" VARCHAR(255),
  ADD COLUMN "googleId" VARCHAR(255),
  ADD COLUMN "intentosRegistro" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ultimoIntentoIp" VARCHAR(45),
  ADD COLUMN "fechaUltimoIntento" TIMESTAMP,
  ALTER COLUMN "contrasenaHash" DROP NOT NULL;

-- Agregar índices únicos para OAuth IDs
CREATE UNIQUE INDEX IF NOT EXISTS "empresas_tokenVerificacion_key" ON empresas("tokenVerificacion");
CREATE UNIQUE INDEX IF NOT EXISTS "empresas_linkedinId_key" ON empresas("linkedinId");
CREATE UNIQUE INDEX IF NOT EXISTS "empresas_googleId_key" ON empresas("googleId");

-- Agregar índices para búsquedas
CREATE INDEX IF NOT EXISTS "empresas_linkedinId_idx" ON empresas("linkedinId");
CREATE INDEX IF NOT EXISTS "empresas_googleId_idx" ON empresas("googleId");

-- Agregar campos a la tabla postulantes
ALTER TABLE postulantes
  ADD COLUMN "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tokenVerificacion" VARCHAR(255),
  ADD COLUMN "tokenExpiracion" TIMESTAMP,
  ADD COLUMN "linkedinId" VARCHAR(255),
  ADD COLUMN "googleId" VARCHAR(255),
  ADD COLUMN "conexionesLinkedin" INTEGER,
  ADD COLUMN "intentosRegistro" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ultimoIntentoIp" VARCHAR(45),
  ADD COLUMN "fechaUltimoIntento" TIMESTAMP,
  ALTER COLUMN "contrasenaHash" DROP NOT NULL;

-- Agregar índices únicos para OAuth IDs
CREATE UNIQUE INDEX IF NOT EXISTS "postulantes_tokenVerificacion_key" ON postulantes("tokenVerificacion");
CREATE UNIQUE INDEX IF NOT EXISTS "postulantes_linkedinId_key" ON postulantes("linkedinId");
CREATE UNIQUE INDEX IF NOT EXISTS "postulantes_googleId_key" ON postulantes("googleId");

-- Agregar índices para búsquedas
CREATE INDEX IF NOT EXISTS "postulantes_linkedinId_idx" ON postulantes("linkedinId");
CREATE INDEX IF NOT EXISTS "postulantes_googleId_idx" ON postulantes("googleId");
