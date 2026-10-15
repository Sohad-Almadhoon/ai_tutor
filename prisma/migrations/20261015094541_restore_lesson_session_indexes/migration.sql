-- CreateIndex
CREATE INDEX "LessonSession_userId_status_endedAt_idx" ON "LessonSession"("userId", "status", "endedAt");

-- CreateIndex
CREATE INDEX "LessonSession_lessonId_idx" ON "LessonSession"("lessonId");
