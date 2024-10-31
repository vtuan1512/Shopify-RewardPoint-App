/*
  Warnings:

  - You are about to drop the column `address` on the `CustomerPoint` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `CustomerPoint` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomerPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomerPoint" ("createdAt", "customerId", "email", "id", "name", "phone", "points", "updatedAt") SELECT "createdAt", "customerId", "email", "id", "name", "phone", "points", "updatedAt" FROM "CustomerPoint";
DROP TABLE "CustomerPoint";
ALTER TABLE "new_CustomerPoint" RENAME TO "CustomerPoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
