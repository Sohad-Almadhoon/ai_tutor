CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "targetDurationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companionId" INTEGER NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Lesson" ("name", "topic", "subject", "targetDurationMinutes", "createdAt", "companionId")
SELECT "name", "topic", "subject", "duration", "createdAt", "id"
FROM "Companion";

ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_companionId_fkey"
    FOREIGN KEY ("companionId") REFERENCES "Companion"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Bookmark" ADD COLUMN "lessonId" INTEGER;
UPDATE "Bookmark"
SET "lessonId" = "Lesson"."id"
FROM "Lesson"
WHERE "Lesson"."companionId" = "Bookmark"."companionId";
ALTER TABLE "Bookmark" ALTER COLUMN "lessonId" SET NOT NULL;
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_companionId_fkey";
DROP INDEX "Bookmark_userId_companionId_key";
ALTER TABLE "Bookmark" DROP COLUMN "companionId";
ALTER TABLE "Bookmark"
    ADD CONSTRAINT "Bookmark_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Bookmark_userId_lessonId_key" ON "Bookmark"("userId", "lessonId");

ALTER TABLE "LessonSession" ADD COLUMN "lessonId" INTEGER;
UPDATE "LessonSession"
SET "lessonId" = "Lesson"."id"
FROM "Lesson"
WHERE "Lesson"."companionId" = "LessonSession"."companionId";
ALTER TABLE "LessonSession" ALTER COLUMN "lessonId" SET NOT NULL;
ALTER TABLE "LessonSession" DROP CONSTRAINT "LessonSession_companionId_fkey";
DROP INDEX "LessonSession_companionId_idx";
ALTER TABLE "LessonSession" DROP COLUMN "companionId";
ALTER TABLE "LessonSession"
    ADD CONSTRAINT "LessonSession_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "LessonSession_lessonId_idx" ON "LessonSession"("lessonId");

ALTER TABLE "Companion"
    DROP COLUMN "topic",
    DROP COLUMN "subject",
    DROP COLUMN "duration";
