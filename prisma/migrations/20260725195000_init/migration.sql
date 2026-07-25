-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE "HypothesisStatus" AS ENUM ('IDEA', 'READY_FOR_PRIORITIZATION', 'PRIORITIZED', 'PLANNED', 'IN_PROGRESS', 'VALIDATED', 'REJECTED', 'ARCHIVED');
CREATE TYPE "ImportIssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

CREATE TABLE "User" ("id" TEXT NOT NULL, "name" TEXT, "email" TEXT, "image" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Workspace" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Membership" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "userId" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'EDITOR', CONSTRAINT "Membership_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Objective" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "title" TEXT NOT NULL, "metric" TEXT, "currentValue" DOUBLE PRECISION, "targetValue" DOUBLE PRECISION, "periodStart" TIMESTAMP(3), "periodEnd" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Objective_pkey" PRIMARY KEY ("id"));
CREATE TABLE "FunnelStage" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "name" TEXT NOT NULL, "position" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "FunnelStage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "PriorityPreset" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "reach" JSONB NOT NULL, "impact" JSONB NOT NULL, "confidence" JSONB NOT NULL, "effort" JSONB NOT NULL, "version" INTEGER NOT NULL DEFAULT 1, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "PriorityPreset_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Hypothesis" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "objectiveId" TEXT, "funnelStageId" TEXT, "ownerId" TEXT, "title" TEXT NOT NULL, "normalizedTitle" TEXT NOT NULL, "hypothesis" TEXT, "actions" TEXT, "dataMethod" TEXT, "expectedUpside" TEXT, "expectedDownside" TEXT, "reachLabel" TEXT, "reachValue" DOUBLE PRECISION, "impactLabel" TEXT, "impactValue" DOUBLE PRECISION, "confidenceLabel" TEXT, "confidenceValue" DOUBLE PRECISION, "effortLabel" TEXT, "effortValue" DOUBLE PRECISION, "score" DOUBLE PRECISION, "status" "HypothesisStatus" NOT NULL DEFAULT 'IDEA', "dueDate" TIMESTAMP(3), "tags" TEXT[] DEFAULT ARRAY[]::TEXT[], "comment" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Hypothesis_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ExperimentLog" ("id" TEXT NOT NULL, "hypothesisId" TEXT NOT NULL, "metric" TEXT, "expected" TEXT, "actual" TEXT, "conclusion" TEXT, "decision" TEXT, "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ExperimentLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "HypothesisHistory" ("id" TEXT NOT NULL, "hypothesisId" TEXT NOT NULL, "actorId" TEXT, "event" TEXT NOT NULL, "payload" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "HypothesisHistory_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ImportBatch" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "fileName" TEXT NOT NULL, "imported" INTEGER NOT NULL DEFAULT 0, "skipped" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ImportIssue" ("id" TEXT NOT NULL, "batchId" TEXT NOT NULL, "rowNumber" INTEGER NOT NULL, "sheetName" TEXT NOT NULL, "reason" TEXT NOT NULL, "payload" JSONB, "status" "ImportIssueStatus" NOT NULL DEFAULT 'OPEN', CONSTRAINT "ImportIssue_pkey" PRIMARY KEY ("id"));

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Membership_workspaceId_userId_key" ON "Membership"("workspaceId", "userId");
CREATE UNIQUE INDEX "FunnelStage_workspaceId_name_key" ON "FunnelStage"("workspaceId", "name");
CREATE UNIQUE INDEX "PriorityPreset_workspaceId_key" ON "PriorityPreset"("workspaceId");
CREATE UNIQUE INDEX "Hypothesis_workspaceId_normalizedTitle_key" ON "Hypothesis"("workspaceId", "normalizedTitle");

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FunnelStage" ADD CONSTRAINT "FunnelStage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriorityPreset" ADD CONSTRAINT "PriorityPreset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_funnelStageId_fkey" FOREIGN KEY ("funnelStageId") REFERENCES "FunnelStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExperimentLog" ADD CONSTRAINT "ExperimentLog_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HypothesisHistory" ADD CONSTRAINT "HypothesisHistory_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImportIssue" ADD CONSTRAINT "ImportIssue_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
