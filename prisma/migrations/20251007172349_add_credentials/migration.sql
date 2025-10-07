-- CreateTable
CREATE TABLE "Credential" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "personId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
