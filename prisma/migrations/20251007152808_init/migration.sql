-- CreateTable
CREATE TABLE "Rj45Connector" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "model" TEXT NOT NULL,
    "quantityUnits" INTEGER NOT NULL DEFAULT 0,
    "material" TEXT,
    "type" TEXT,
    "purchaseDate" DATETIME,
    "usageDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
