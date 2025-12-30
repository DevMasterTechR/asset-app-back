-- CreateTable
CREATE TABLE "Mouse" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "connectionType" TEXT,
    "dpi" INTEGER,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyboard" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "connectionType" TEXT,
    "layout" TEXT,
    "isNumeric" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MousePad" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "material" TEXT,
    "size" TEXT,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MousePad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryAdapter" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "adapterType" TEXT,
    "compatibility" TEXT,
    "speed" TEXT,
    "color" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "usageDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryAdapter_pkey" PRIMARY KEY ("id")
);
