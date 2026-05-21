-- Script alternativo: Solo AGREGAR columnas faltantes a tablas existentes
-- Ejecutar en Supabase SQL Editor cuando la base de datos ya existe

-- 1. Crear enums si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActaStatus') THEN
    CREATE TYPE "ActaStatus" AS ENUM ('no_generada', 'acta_generada', 'firmada');
  END IF;
END $$;

-- 2. Agregar columnas faltantes a AssignmentHistory (sin recrear la tabla)
ALTER TABLE "AssignmentHistory"
  ADD COLUMN IF NOT EXISTS "parentAssignmentId" INTEGER,
  ADD COLUMN IF NOT EXISTS "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  ADD COLUMN IF NOT EXISTS "actaFirmadaAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "actaRecepcionStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  ADD COLUMN IF NOT EXISTS "actaRecepcionFirmadaAt" TIMESTAMP(3);

-- 3. Agregar constraint de foreign key si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'AssignmentHistory_parentAssignmentId_fkey'
  ) THEN
    ALTER TABLE "AssignmentHistory"
      ADD CONSTRAINT "AssignmentHistory_parentAssignmentId_fkey"
      FOREIGN KEY ("parentAssignmentId")
      REFERENCES "AssignmentHistory"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION;
  END IF;
END $$;

-- 4. Agregar índice si no existe
CREATE INDEX IF NOT EXISTS "AssignmentHistory_parentAssignmentId_idx"
  ON "AssignmentHistory"("parentAssignmentId");

-- 5. Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'AssignmentHistory'
ORDER BY ordinal_position;
