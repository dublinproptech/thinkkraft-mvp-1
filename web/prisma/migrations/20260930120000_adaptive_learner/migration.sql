-- AlterTable
ALTER TABLE "SkillMastery" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pMastery" DOUBLE PRECISION NOT NULL DEFAULT 0.2;

-- CreateTable
CREATE TABLE "LearningEvidence" (
    "id" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "hintLevel" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "LearningEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningEvidence_studentId_skill_idx" ON "LearningEvidence"("studentId", "skill");

-- AddForeignKey
ALTER TABLE "LearningEvidence" ADD CONSTRAINT "LearningEvidence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
