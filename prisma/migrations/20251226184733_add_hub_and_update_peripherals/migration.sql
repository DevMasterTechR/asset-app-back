-- AlterTable
ALTER TABLE "Keyboard" ADD COLUMN     "language" TEXT;

-- AlterTable
ALTER TABLE "MousePad" ALTER COLUMN "brand" DROP NOT NULL,
ALTER COLUMN "model" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Hub" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "portCount" INTEGER,
    "usbType" TEXT,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);
