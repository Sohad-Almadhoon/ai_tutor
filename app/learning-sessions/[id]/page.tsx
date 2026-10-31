import { getLessonSessionAction } from "@/actions/lesson-session.action";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";

type SessionTranscriptEntry = {
  role: "user" | "assistant";
  text: string;
};

function isTranscriptEntry(value: unknown): value is SessionTranscriptEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    (entry.role === "user" || entry.role === "assistant") &&
    typeof entry.text === "string"
  );
}

const LessonSessionTranscriptPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const sessionId = Number(id);
  const result =
    Number.isSafeInteger(sessionId) && sessionId > 0
      ? await getLessonSessionAction(sessionId)
      : null;

  if (!result?.success) {
    const message =
      result?.error === "Unauthorized"
        ? "Sign in to review your lesson sessions."
        : result?.error === "Lesson session not found"
          ? "This lesson session could not be found."
          : result?.error ?? "This lesson session could not be found.";
    const backHref =
      result?.error === "Unauthorized"
        ? "/sign-in?redirect_url=/learning-sessions"
        : "/learning-sessions";

    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <section
          role="alert"
          className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm"
        >
          <p className="text-sm leading-6 text-red-700">{message}</p>
          <Link
            href={backHref}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sessions
          </Link>
        </section>
      </main>
    );
  }

  const session = result.data;
  const transcript = Array.isArray(session.transcript)
    ? session.transcript.filter(isTranscriptEntry)
    : [];
  const tutorName = session.companion?.name ?? "Tutor";

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/learning-sessions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All sessions
      </Link>

      <header className="mb-7">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-600">
          <BookOpen className="size-4" aria-hidden="true" />
          {session.lesson.subject} · Session transcript
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {session.lesson.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(session.startedAt)}
        </p>
      </header>

      {transcript.length > 0 ? (
        <section
          aria-label="Lesson conversation transcript"
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {transcript.map((entry, index) => {
            const isTutor = entry.role === "assistant";
            return (
              <article
                key={`${index}-${entry.role}`}
                className={`rounded-2xl p-4 ${
                  isTutor ? "bg-slate-50" : "bg-violet-50"
                }`}
              >
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  {isTutor ? (
                    <GraduationCap
                      className="size-4 text-violet-600"
                      aria-hidden="true"
                    />
                  ) : null}
                  {isTutor ? tutorName : "You"}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {entry.text}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            No transcript available
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Transcripts are saved when a voice lesson ends. This session has no
            saved conversation.
          </p>
        </section>
      )}
    </main>
  );
};

export default LessonSessionTranscriptPage;
