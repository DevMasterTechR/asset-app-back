-- AlterTable
ALTER TABLE "AssignmentHistory" ADD COLUMN     "actaFirmadaAt" TIMESTAMP(3),
ADD COLUMN     "actaRecepcionFirmadaAt" TIMESTAMP(3),
ADD COLUMN     "actaRecepcionStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada';
