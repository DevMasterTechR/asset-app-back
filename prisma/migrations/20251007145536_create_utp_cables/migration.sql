-- CreateTable
CREATE TABLE "UtpCable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "brand" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "material" TEXT,
    "lengthMeters" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "purchaseDate" DATETIME,
    "usageDate" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
