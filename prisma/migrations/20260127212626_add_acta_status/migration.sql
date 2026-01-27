-- CreateEnum
CREATE TYPE "ActaStatus" AS ENUM ('no_generada', 'acta_generada', 'firmada');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada';
