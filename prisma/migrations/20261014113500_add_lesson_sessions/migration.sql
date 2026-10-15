CREATE TYPE "LessonSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

CREATE TABLE "LessonSession" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "companionId" INTEGER NOT NULL,
    "status" "LessonSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,

    CONSTRAINT "LessonSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonSession_userId_status_endedAt_idx" ON "LessonSession"("userId", "status", "endedAt");
CREATE INDEX "LessonSession_companionId_idx" ON "LessonSession"("companionId");

ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonSession" ADD CONSTRAINT "LessonSession_companionId_fkey"
    FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
