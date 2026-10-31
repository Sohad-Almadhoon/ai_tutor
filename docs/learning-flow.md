# Learning Flow and Data Model

## Core concepts

The platform has three separate concepts:

| Concept | Meaning | Example |
| --- | --- | --- |
| **Companion** | A reusable AI tutor: identity, generated description, avatar, Vapi voice provider and voice, language, speaking style, owner, and visibility. | Luna, an English tutor |
| **Lesson** | One topic a Companion teaches, including its subject and estimated target duration. | English Tenses, Language, 20 minutes |
| **LessonSession** | One learner's attempt at one Lesson, with its own status and actual elapsed duration. | A learner's 18-minute attempt at English Tenses |

The relationship is:

```text
User (owns Companions)
└── Companion
    ├── Lesson A
    │   ├── LessonSessions from learners
    │   └── Bookmarks from learners
    └── Lesson B
        ├── LessonSessions from learners
        └── Bookmarks from learners
```

A Companion can teach many Lessons. Each Lesson belongs to one Companion. A Lesson can have many sessions and bookmarks.

## Owner flow

1. The signed-in user creates a Companion, setting its name, avatar, Vapi voice provider and voice, language, and speaking style. The backend generates and stores a short description from the name and speaking style.
2. The owner chooses whether the Companion is private or public and creates its first Lesson.
3. The owner can add more Lessons to that Companion. Each Lesson has a name, subject, topic, and target duration in minutes.
4. The owner can edit or delete their Companions and Lessons.
5. If the Companion is public, its Lessons are discoverable and usable by other signed-in users. If private, only its owner can access them.

Visibility currently belongs to the **Companion**, so all Lessons under that Companion inherit the same visibility. Per-Lesson visibility would require a separate Lesson visibility field and corresponding access rules.

## Learner flow

1. The learner opens the Lesson Library and searches or filters by Lesson name, topic, or subject.
2. Each Lesson card shows the Lesson name, topic, subject, target duration, and the Companion who teaches it.
3. The learner starts a Lesson. The server verifies that the Lesson exists and that its Companion is either owned by the learner or public.
4. The server creates a `LessonSession` with status `IN_PROGRESS`, linked to the learner and Lesson.
5. The learning experience uses the Lesson's content and the associated Companion's voice and tutor settings.
6. When the learner finishes, the session becomes `COMPLETED`; the server records its end time and actual elapsed duration.
7. If the learner leaves without completing, the session should be marked `ABANDONED`, not `COMPLETED`.
8. Final Vapi transcript messages are saved on the session when it ends. Learners can review the conversation from their session history.

## Duration rules

There are two different duration values:

- `Lesson.targetDurationMinutes` is the estimated or recommended time for the Lesson. It is informational; it does **not** automatically end a session.
- `LessonSession.durationSeconds` is the actual elapsed time for one attempt, calculated from its start and end timestamps when completed.
- `LessonSession.transcript` stores the final user and tutor utterances as JSON for later review.

The current elapsed-time calculation measures wall-clock time between starting and completing the session. It does not distinguish active conversation time from idle time. If the product needs a hard time limit or active speaking-time measurement, that needs additional runtime behavior.

## Counting completed lessons and sessions

To count completed **attempts**, ask the database for a count; do not load every session and loop through them:

```ts
const completedSessionCount = await prisma.lessonSession.count({
  where: {
    userId,
    status: "COMPLETED",
  },
});
```

If a learner completes the same Lesson three times, this count is three. That is what a metric such as “Lessons Completed” usually means when it tracks completed sessions.

To count **distinct Lessons** completed, count distinct `lessonId` values among completed sessions instead. That metric would count the same Lesson only once, even if the learner completed it multiple times.

The session-history action paginates the sessions and separately counts all matching sessions, so the total is not limited to the current page.

## Page responsibilities

### Lesson Library

Show **Lessons**, because learners choose a topic to study. Each card should identify the Lesson and also show which Companion teaches it. Search and subject filters apply to Lessons.

### Companion management

Show the signed-in user's **Companions**. Owners can configure tutor settings, visibility, and the Lessons offered by each tutor.

### Companion details

Show the tutor profile and the list of Lessons it teaches. Owners can add, edit, or remove Lessons here.

### Lesson session

Show the selected Lesson's details and its Companion's tutor identity and voice controls. Starting the interaction creates a `LessonSession` for the selected `lessonId`.

### My Journey

Show the current learner's `LessonSession` history, with status, Lesson, Companion, dates, and actual elapsed duration. Summary counts should come from database aggregates, not client-side loops over all history.

## API flow

Internal application code should call the matching Server Actions in `actions/`:

- `companion.action.ts`: list, create, get, update visibility, and delete Companions.
- `lesson.action.ts`: list and create a Companion's Lessons, discover public Lessons, and get, update, or delete a Lesson.
- `lesson-session.action.ts`: list, start, fetch, and finish LessonSessions.
- `bookmark.action.ts`: list, create, and delete bookmarks.
- `user.action.ts`: get the current user or a user by ID.

The `/api/*` route handlers are thin compatibility adapters for external clients; database access and validation live in the Server Actions.

## Current implementation notes

- The Prisma schema separates `Companion`, `Lesson`, and `LessonSession`.
- Existing Companion records are migrated into one initial Lesson each; their old duration is copied to `targetDurationMinutes`, and existing bookmarks and sessions are relinked to that Lesson.
- Companion visibility defaults to private. A public Companion exposes its Lessons to other signed-in users.
- Server Actions exist for Companion and Lesson data, discovery, bookmarks, and session start/completion.
- The Server Actions are ready for the Lesson Library and My Journey pages to consume directly.
- An explicit action for marking an in-progress session `ABANDONED` still needs implementation if the UI is to record that state.
- Apply the Prisma migrations to the target database before using the updated data model.
