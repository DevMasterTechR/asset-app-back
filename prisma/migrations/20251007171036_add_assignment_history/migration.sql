-- CreateTable
CREATE TABLE "AssignmentHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "branchId" INTEGER,
    "assignmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" DATETIME,
    "deliveryCondition" TEXT NOT NULL DEFAULT 'good',
    "returnCondition" TEXT,
    "deliveryNotes" TEXT,
    "returnNotes" TEXT
);
