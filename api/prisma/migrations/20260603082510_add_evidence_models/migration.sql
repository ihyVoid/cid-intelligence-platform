-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeaponEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "CarEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "trim" TEXT,
    "plateNumber" TEXT,
    "plateState" TEXT,
    "vin" TEXT,
    "color" TEXT,
    "interiorColor" TEXT,
    "bodyStyle" TEXT,
    "owner" TEXT,
    "registeredOwner" TEXT,
    "insuranceStatus" TEXT,
    "condition" TEXT,
    "mileage" INTEGER,
    "damage" TEXT,
    "seizedFrom" TEXT,
    "seizureLocation" TEXT,
    "seizureDate" TEXT,
    "model3dUrl" TEXT,
    "model3dType" TEXT,
    "images" TEXT,
    "currentStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "originalFilename" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "dimensions" TEXT,
    "caption" TEXT,
    "locationTaken" TEXT,
    "dateTaken" TEXT,
    "cameraModel" TEXT,
    "gpsCoordinates" TEXT,
    "contentType" TEXT,
    "containsFaces" BOOLEAN,
    "facesDetected" INTEGER,
    "facesIdentified" TEXT,
    "analysisNotes" TEXT,
    "enhancementApplied" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImageEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "pages" INTEGER,
    "summary" TEXT,
    "keyParties" TEXT,
    "dateIssued" TEXT,
    "dateExpires" TEXT,
    "issuingAuthority" TEXT,
    "securityLevel" TEXT,
    "verified" BOOLEAN,
    "verificationNotes" TEXT,
    "analysisNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceEvidenceId" TEXT NOT NULL,
    "targetEvidenceId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "description" TEXT,
    "confidence" TEXT,
    "caseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceRelationship_sourceEvidenceId_fkey" FOREIGN KEY ("sourceEvidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceRelationship_targetEvidenceId_fkey" FOREIGN KEY ("targetEvidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Suspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Suspect_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relationship_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvestigationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvestigationLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GraphNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "metadata" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GraphNode_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GraphEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "label" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GraphEdge_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponEvidence_evidenceId_key" ON "WeaponEvidence"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "CarEvidence_evidenceId_key" ON "CarEvidence"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageEvidence_evidenceId_key" ON "ImageEvidence"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentEvidence_evidenceId_key" ON "DocumentEvidence"("evidenceId");
