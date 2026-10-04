
-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Enrolment" DROP CONSTRAINT "Enrolment_studentId_fkey";

-- DropForeignKey
ALTER TABLE "HintEvent" DROP CONSTRAINT "HintEvent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "LearningEvidence" DROP CONSTRAINT "LearningEvidence_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SkillMastery" DROP CONSTRAINT "SkillMastery_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_studentId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HintEvent" ADD CONSTRAINT "HintEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMastery" ADD CONSTRAINT "SkillMastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvidence" ADD CONSTRAINT "LearningEvidence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

