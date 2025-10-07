-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StorageCapacity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "capacityGb" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StorageCapacity_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StorageCapacity" ("assetId", "capacityGb", "createdAt", "id", "notes", "type", "updatedAt") SELECT "assetId", "capacityGb", "createdAt", "id", "notes", "type", "updatedAt" FROM "StorageCapacity";
DROP TABLE "StorageCapacity";
ALTER TABLE "new_StorageCapacity" RENAME TO "StorageCapacity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
