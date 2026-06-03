/*
  Warnings:

  - You are about to drop the column `caseId` on the `EvidenceRelationship` table. All the data in the column will be lost.
  - Added the required column `date` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportingAgent` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `InvestigationLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CaseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "executiveSummary" TEXT,
    "detailedReport" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "attachments" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    "authorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseReport_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CaseReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Victim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "alias" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "medicalNotes" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Victim_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Witness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "alias" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "statement" TEXT,
    "statementDate" TEXT,
    "statementTime" TEXT,
    "credibility" TEXT NOT NULL,
    "reliabilityScore" INTEGER,
    "description" TEXT,
    "protectionStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Witness_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "reportingAgent" TEXT NOT NULL,
    "handler" TEXT,
    "involvedAgents" TEXT,
    "teamMembers" TEXT,
    "actionsTaken" TEXT,
    "recommendedNextStep" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "phase" TEXT,
    "riskLevel" TEXT,
    "budget" REAL,
    "duration" INTEGER,
    "tags" TEXT,
    "intelligenceValue" TEXT,
    "threatLevel" TEXT,
    "operationType" TEXT,
    "operationStatus" TEXT,
    "auditTrail" TEXT
);
INSERT INTO "new_Case" ("caseNumber", "classification", "createdAt", "createdBy", "description", "id", "priority", "status", "title", "type") SELECT "caseNumber", "classification", "createdAt", "createdBy", "description", "id", "priority", "status", "title", "type" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");
CREATE TABLE "new_EvidenceRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceEvidenceId" TEXT NOT NULL,
    "targetEvidenceId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "description" TEXT,
    "confidence" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceRelationship_sourceEvidenceId_fkey" FOREIGN KEY ("sourceEvidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceRelationship_targetEvidenceId_fkey" FOREIGN KEY ("targetEvidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EvidenceRelationship" ("confidence", "createdAt", "description", "id", "relationshipType", "sourceEvidenceId", "targetEvidenceId") SELECT "confidence", "createdAt", "description", "id", "relationshipType", "sourceEvidenceId", "targetEvidenceId" FROM "EvidenceRelationship";
DROP TABLE "EvidenceRelationship";
ALTER TABLE "new_EvidenceRelationship" RENAME TO "EvidenceRelationship";
CREATE TABLE "new_InvestigationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestigationLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvestigationLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InvestigationLog" ("caseId", "createdAt", "createdBy", "id", "message") SELECT "caseId", "createdAt", "createdBy", "id", "message" FROM "InvestigationLog";
DROP TABLE "InvestigationLog";
ALTER TABLE "new_InvestigationLog" RENAME TO "InvestigationLog";
CREATE TABLE "new_Suspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "alias" TEXT,
    "dateOfBirth" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "eyeColor" TEXT,
    "hairColor" TEXT,
    "threatLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "distinguishingMarks" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "criminalHistory" TEXT,
    "wantedStatus" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Suspect_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Suspect" ("caseId", "createdAt", "description", "fullName", "id", "imageUrl", "status", "threatLevel") SELECT "caseId", "createdAt", "description", "fullName", "id", "imageUrl", "status", "threatLevel" FROM "Suspect";
DROP TABLE "Suspect";
ALTER TABLE "new_Suspect" RENAME TO "Suspect";
CREATE TABLE "new_TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "eventDate" TEXT,
    "type" TEXT NOT NULL,
    "classification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    "source" TEXT,
    "location" TEXT,
    "evidenceIds" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TimelineEvent" ("caseId", "createdAt", "description", "eventTime", "id", "title") SELECT "caseId", "createdAt", "description", "eventTime", "id", "title" FROM "TimelineEvent";
DROP TABLE "TimelineEvent";
ALTER TABLE "new_TimelineEvent" RENAME TO "TimelineEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
