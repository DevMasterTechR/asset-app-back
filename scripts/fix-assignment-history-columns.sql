-- Reparacion de columnas faltantes en AssignmentHistory para entornos donde
-- no se aplicaron las migraciones recientes de Prisma.
-- Seguro de ejecutar varias veces (idempotente).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ActaStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "ActaStatus" AS ENUM ('no_generada', 'acta_generada', 'firmada');
  END IF;
END
$$;

ALTER TABLE "AssignmentHistory"
  ADD COLUMN IF NOT EXISTS "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  ADD COLUMN IF NOT EXISTS "actaFirmadaAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "actaRecepcionStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada',
  ADD COLUMN IF NOT EXISTS "actaRecepcionFirmadaAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "parentAssignmentId" INTEGER;

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
END
$$;

CREATE INDEX IF NOT EXISTS "AssignmentHistory_parentAssignmentId_idx"
  ON "AssignmentHistory"("parentAssignmentId");
