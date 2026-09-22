-- AlterTable
ALTER TABLE "HintEvent" ADD COLUMN     "answeredHintId" TEXT,
ADD COLUMN     "childAnswer" TEXT,
ADD COLUMN     "dismissedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "HintEvent" ADD CONSTRAINT "HintEvent_answeredHintId_fkey" FOREIGN KEY ("answeredHintId") REFERENCES "HintEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
