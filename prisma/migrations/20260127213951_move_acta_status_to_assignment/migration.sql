/*
  Warnings:

  - You are about to drop the column `actaStatus` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SystemType" ADD VALUE 'phone';

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "actaStatus";

-- AlterTable
ALTER TABLE "AssignmentHistory" ADD COLUMN     "actaStatus" "ActaStatus" NOT NULL DEFAULT 'no_generada';
