-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('equipment_replacement', 'consumables', 'equipment_request');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pendiente_rrhh', 'rrhh_rechazada', 'pendiente_admin', 'aceptada', 'rechazada');

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pendiente_rrhh',
    "payload" JSONB,
    "hrReason" TEXT,
    "adminReason" TEXT,
    "hrReviewerId" INTEGER,
    "adminReviewerId" INTEGER,
    "hrSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_code_key" ON "Request"("code");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_hrReviewerId_fkey" FOREIGN KEY ("hrReviewerId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_adminReviewerId_fkey" FOREIGN KEY ("adminReviewerId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
