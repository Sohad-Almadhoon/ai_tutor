ALTER TABLE "Lesson" RENAME COLUMN "companionId" TO "defaultCompanionId";

ALTER TABLE "Lesson"
    ADD COLUMN "createdById" TEXT,
    ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Lesson"
SET
    "createdById" = "Companion"."userId",
    "isPublic" = "Companion"."isPublic"
FROM "Companion"
WHERE "Lesson"."defaultCompanionId" = "Companion"."id";

ALTER TABLE "Lesson" ALTER COLUMN "createdById" SET NOT NULL;

ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_companionId_fkey";
ALTER TABLE "Lesson" ALTER COLUMN "defaultCompanionId" DROP NOT NULL;
ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_defaultCompanionId_fkey"
    FOREIGN KEY ("defaultCompanionId") REFERENCES "Companion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
