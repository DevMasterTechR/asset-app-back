-- CreateTable
CREATE TABLE "PowerStrip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand" TEXT,
    "model" TEXT NOT NULL,
    "outletCount" INTEGER,
    "lengthMeters" REAL,
    "color" TEXT,
    "capacity" INTEGER,
    "purchaseDate" DATETIME,
    "usageDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
