-- AlterTable
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Person_codigo_key" ON "Person"("codigo");
