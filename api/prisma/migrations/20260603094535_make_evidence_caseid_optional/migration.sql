-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
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
    CONSTRAINT "CaseReport_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CaseReport" ("approvedAt", "approvedBy", "attachments", "authorId", "caseId", "classification", "createdAt", "detailedReport", "executiveSummary", "findings", "id", "recommendations", "reportNumber", "reportType", "reviewedAt", "reviewedBy", "status", "title", "updatedAt") SELECT "approvedAt", "approvedBy", "attachments", "authorId", "caseId", "classification", "createdAt", "detailedReport", "executiveSummary", "findings", "id", "recommendations", "reportNumber", "reportType", "reviewedAt", "reviewedBy", "status", "title", "updatedAt" FROM "CaseReport";
DROP TABLE "CaseReport";
ALTER TABLE "new_CaseReport" RENAME TO "CaseReport";
CREATE TABLE "new_Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Evidence" ("caseId", "classification", "createdAt", "createdBy", "description", "evidenceType", "id", "title", "updatedAt") SELECT "caseId", "classification", "createdAt", "createdBy", "description", "evidenceType", "id", "title", "updatedAt" FROM "Evidence";
DROP TABLE "Evidence";
ALTER TABLE "new_Evidence" RENAME TO "Evidence";
CREATE TABLE "new_InvestigationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestigationLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InvestigationLog_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InvestigationLog" ("caseId", "createdAt", "createdBy", "id", "message", "type") SELECT "caseId", "createdAt", "createdBy", "id", "message", "type" FROM "InvestigationLog";
DROP TABLE "InvestigationLog";
ALTER TABLE "new_InvestigationLog" RENAME TO "InvestigationLog";
CREATE TABLE "new_Suspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
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
    CONSTRAINT "Suspect_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Suspect" ("address", "alias", "caseId", "createdAt", "criminalHistory", "dateOfBirth", "description", "distinguishingMarks", "email", "eyeColor", "fullName", "gender", "hairColor", "height", "id", "imageUrl", "nationality", "phone", "status", "threatLevel", "wantedStatus", "weight") SELECT "address", "alias", "caseId", "createdAt", "criminalHistory", "dateOfBirth", "description", "distinguishingMarks", "email", "eyeColor", "fullName", "gender", "hairColor", "height", "id", "imageUrl", "nationality", "phone", "status", "threatLevel", "wantedStatus", "weight" FROM "Suspect";
DROP TABLE "Suspect";
ALTER TABLE "new_Suspect" RENAME TO "Suspect";
CREATE TABLE "new_TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
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
    CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TimelineEvent" ("caseId", "classification", "createdAt", "createdBy", "description", "eventDate", "eventTime", "evidenceIds", "id", "location", "source", "title", "type", "verified", "verifiedAt", "verifiedBy") SELECT "caseId", "classification", "createdAt", "createdBy", "description", "eventDate", "eventTime", "evidenceIds", "id", "location", "source", "title", "type", "verified", "verifiedAt", "verifiedBy" FROM "TimelineEvent";
DROP TABLE "TimelineEvent";
ALTER TABLE "new_TimelineEvent" RENAME TO "TimelineEvent";
CREATE TABLE "new_Victim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
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
    CONSTRAINT "Victim_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Victim" ("address", "alias", "caseId", "createdAt", "dateOfBirth", "description", "email", "fullName", "gender", "id", "imageUrl", "medicalNotes", "nationality", "phone", "status") SELECT "address", "alias", "caseId", "createdAt", "dateOfBirth", "description", "email", "fullName", "gender", "id", "imageUrl", "medicalNotes", "nationality", "phone", "status" FROM "Victim";
DROP TABLE "Victim";
ALTER TABLE "new_Victim" RENAME TO "Victim";
CREATE TABLE "new_Witness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT,
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
    CONSTRAINT "Witness_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Witness" ("address", "alias", "caseId", "createdAt", "credibility", "description", "email", "fullName", "id", "phone", "protectionStatus", "reliabilityScore", "statement", "statementDate", "statementTime") SELECT "address", "alias", "caseId", "createdAt", "credibility", "description", "email", "fullName", "id", "phone", "protectionStatus", "reliabilityScore", "statement", "statementDate", "statementTime" FROM "Witness";
DROP TABLE "Witness";
ALTER TABLE "new_Witness" RENAME TO "Witness";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
