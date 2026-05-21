-- =====================================================================
-- SCRIPT DEFINITIVO DE REPARACIÓN DE BASE DE DATOS
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================================

-- 1. Asegurar Enums necesarios
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActaStatus') THEN
        CREATE TYPE "ActaStatus" AS ENUM ('no_generada', 'acta_generada', 'firmada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssetStatus') THEN
        CREATE TYPE "AssetStatus" AS ENUM ('available', 'assigned', 'loaned', 'maintenance', 'decommissioned', 'ti');
    END IF;
END $$;

-- 2. Función auxiliar para renombrar columnas de forma segura
CREATE OR REPLACE FUNCTION rename_column_if_exists(t_name text, old_col text, new_col text) 
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = old_col) 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = new_col) THEN
        EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', t_name, old_col, new_col);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Corregir nombres de columnas (Snake Case -> Camel Case) donde Prisma lo requiere
SELECT rename_column_if_exists('Person', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Person', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Asset', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Asset', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Rj45Connector', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Rj45Connector', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('PowerStrip', 'created_at', 'createdAt');
SELECT rename_column_if_exists('PowerStrip', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Mouse', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Mouse', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Keyboard', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Keyboard', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('MousePad', 'created_at', 'createdAt');
SELECT rename_column_if_exists('MousePad', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('MemoryAdapter', 'created_at', 'createdAt');
SELECT rename_column_if_exists('MemoryAdapter', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Hub', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Hub', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('NetworkAdapter', 'created_at', 'createdAt');
SELECT rename_column_if_exists('NetworkAdapter', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Support', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Support', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Loan', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Loan', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Credential', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Credential', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('SimCard', 'created_at', 'createdAt');
SELECT rename_column_if_exists('SimCard', 'updated_at', 'updatedAt');
SELECT rename_column_if_exists('Request', 'created_at', 'createdAt');
SELECT rename_column_if_exists('Request', 'updated_at', 'updatedAt');

-- 4. Añadir columnas faltantes (si no existen)
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "currentToken" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3);
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "observation" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "tiAssetIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;

ALTER TABLE "AssignmentHistory" ADD COLUMN IF NOT EXISTS "parentAssignmentId" INTEGER;
ALTER TABLE "AssignmentHistory" ADD COLUMN IF NOT EXISTS "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada';
ALTER TABLE "AssignmentHistory" ADD COLUMN IF NOT EXISTS "actaFirmadaAt" TIMESTAMP(3);
ALTER TABLE "AssignmentHistory" ADD COLUMN IF NOT EXISTS "actaRecepcionStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada';
ALTER TABLE "AssignmentHistory" ADD COLUMN IF NOT EXISTS "actaRecepcionFirmadaAt" TIMESTAMP(3);

-- Foreign Key para parentAssignmentId
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'AssignmentHistory_parentAssignmentId_fkey') THEN
        ALTER TABLE "AssignmentHistory" ADD CONSTRAINT "AssignmentHistory_parentAssignmentId_fkey" FOREIGN KEY ("parentAssignmentId") REFERENCES "AssignmentHistory" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    END IF;
END $$;

-- Columnas en consumibles
ALTER TABLE "Ink" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;
ALTER TABLE "UtpCable" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;
ALTER TABLE "Rj45Connector" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;
ALTER TABLE "PowerStrip" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;

-- 5. Limpieza
DROP FUNCTION IF EXISTS rename_column_if_exists(text, text, text);

SELECT 'ÉXITO: Base de datos corregida y sincronizada con Prisma' AS resultado;
