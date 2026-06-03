-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeaponEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "weaponType" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "caliber" TEXT,
    "condition" TEXT,
    "quality" TEXT,
    "owner" TEXT,
    "registeredOwner" TEXT,
    "licenseStatus" TEXT,
    "seizedFrom" TEXT,
    "seizureLocation" TEXT,
    "seizureDate" TEXT,
    "chainOfCustody" TEXT,
    "model3dUrl" TEXT,
    "model3dType" TEXT,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeaponEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WeaponEvidence" ("brand", "caliber", "chainOfCustody", "condition", "createdAt", "evidenceId", "id", "images", "licenseStatus", "model", "model3dType", "model3dUrl", "owner", "quality", "registeredOwner", "seizedFrom", "seizureDate", "seizureLocation", "serialNumber", "updatedAt", "weaponType") SELECT "brand", "caliber", "chainOfCustody", "condition", "createdAt", "evidenceId", "id", "images", "licenseStatus", "model", "model3dType", "model3dUrl", "owner", "quality", "registeredOwner", "seizedFrom", "seizureDate", "seizureLocation", "serialNumber", "updatedAt", "weaponType" FROM "WeaponEvidence";
DROP TABLE "WeaponEvidence";
ALTER TABLE "new_WeaponEvidence" RENAME TO "WeaponEvidence";
CREATE UNIQUE INDEX "WeaponEvidence_evidenceId_key" ON "WeaponEvidence"("evidenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
