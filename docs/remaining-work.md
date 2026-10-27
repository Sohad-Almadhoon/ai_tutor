# Remaining Work

This checklist reflects the current repository state. Core Prisma relationships and Server Actions exist, but several product flows are not yet connected end to end.

## Priority 1 — Make the learning flow usable

- [x] Build the Lesson Library: list public lessons, search by lesson/companion/topic, and filter by subject.
- [x] Build the Companion details page with tutor information and lesson previews.
- [x] Build My Journey with learning statistics and recently completed sessions.
- [x] Build My Learning Sessions with status filters, duration, lesson, and selected tutor.
- [x] Add a lesson-start flow that lets the learner choose an available Companion and calls `startLessonSessionAction(lessonId, companionId)`.
- [x] Connect the lesson experience to Vapi: pass the selected provider and voice, provide lesson and tutor context, and handle call start/end/errors.
- [x] Mark sessions `COMPLETED` when the learner finishes and `ABANDONED` when the call cannot start or the learner leaves the lesson page.

## Priority 2 — Finish Companion and lesson management

- [ ] Add an edit action and owner UI for Companion name, avatar, voice, language, teaching style, and description. Companion updates currently cover visibility only.
- [ ] Add UI to create, edit, and delete additional lessons after the first lesson created with a Companion.
- [ ] Make the Companion card actions functional: the bookmark icon and “Explore lessons” label are currently presentation only.
- [ ] Add discovery search and subject filters to the Companion/Lesson browsing pages.
- [ ] Decide whether private Companions should be hidden from all other users (current access rules treat them as owner-only).

## Priority 3 — User and voice configuration

- [ ] Ensure every Clerk account has a corresponding database `User` before creating Companions or Bookmarks. Session start currently upserts the user, but Companion creation relies on the user row already existing.
- [ ] Configure and verify Vapi credentials and the enabled voice providers in the target environment (see the README setup instructions).
- [ ] Verify each listed voice ID and provider against the Vapi account; keep the picker limited to voices actually available to the project.
- [ ] Decide how to handle learners whose selected voice provider is unavailable or whose provider credentials are not configured.

## Priority 4 — Reliability and release readiness

- [ ] Add automated tests for Server Actions: authentication, access control, validation, selected-tutor session creation, bookmarks, and session completion/abandonment.
- [ ] Add an end-to-end test for creating a Companion with its first Lesson, discovering the Lesson, starting it with a different Companion, and checking My Journey.
- [ ] Resolve the current TypeScript check blockers: `app/companions/[id]/page.tsx` and `app/my-journey/page.tsx` are empty and are reported through `.next/types`.
- [ ] Add user-facing loading, empty, success, and failure states to the learning pages and forms.
- [ ] Verify the full production build and deployment environment, including applied Prisma migrations and Clerk/Vapi configuration.

## Already in place

- [x] Prisma models represent Users, Companions, Lessons, Bookmarks, and LessonSessions.
- [x] A Lesson belongs to its original Companion; Bookmarks are unique per user and lesson.
- [x] LessonSession has an optional selected Companion relation, independent of the Lesson's original Companion.
- [x] Server Actions cover Companion, Lesson, Bookmark, User, and LessonSession data operations.
- [x] Companion creation stores the generated description, selected voice provider, selected voice, and first Lesson.
- [x] The Companion creation wizard has four steps and a live preview.
