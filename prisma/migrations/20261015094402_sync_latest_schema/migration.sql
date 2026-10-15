-- DropIndex
DROP INDEX "LessonSession_lessonId_idx";

-- DropIndex
DROP INDEX "LessonSession_userId_status_endedAt_idx";

-- AlterTable
ALTER TABLE "LessonSession" ADD COLUMN     "companionId" INTEGER;

-- AddForeignKey
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
