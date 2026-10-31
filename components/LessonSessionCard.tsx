import { CalendarClock, Clock3, GraduationCap } from "lucide-react";
import Link from "next/link";

type LessonSessionCardProps = {
  session: {
    id: number;
    status: string;
    startedAt: Date;
    endedAt: Date | null;
    durationSeconds: number | null;
    lesson: {
      id: number;
      name: string;
      subject: string;
      topic: string;
      targetDurationMinutes: number;
      defaultCompanion: { name: string; companionIcon: string } | null;
    };
    companion: { name: string; companionIcon: string } | null;
  };
};

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  ABANDONED: "bg-slate-100 text-slate-600",
};

function formatDuration(seconds: number | null) {
  if (seconds === null) return "Duration not recorded";
  if (seconds < 60) return `${seconds} sec`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} min ${remainingSeconds} sec`
      : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

const LessonSessionCard = ({ session }: LessonSessionCardProps) => {
  const sessionTutor = session.companion;
  const originalTutor = session.lesson.defaultCompanion;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
            {session.lesson.subject}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {session.lesson.name}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[session.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {session.status.replaceAll("_", " ")}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
        {session.lesson.topic}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5 text-violet-500" aria-hidden="true" />
          {new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(session.startedAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5 text-violet-500" aria-hidden="true" />
          {formatDuration(session.durationSeconds)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-0 space-y-2">
          <TutorLabel label="Session tutor" tutor={sessionTutor ?? originalTutor} />
          {originalTutor &&
            sessionTutor &&
            originalTutor.name !== sessionTutor.name && (
              <TutorLabel label="Lesson tutor" tutor={originalTutor} />
            )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {session.status !== "IN_PROGRESS" && (
            <Link
              href={`/learning-sessions/${session.id}`}
              className="rounded-sm text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              Review transcript
            </Link>
          )}
          <Link
            href={`/lessons/${session.lesson.id}`}
            className="rounded-sm text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            {session.status === "IN_PROGRESS" ? "Open lesson" : "Study again"}
          </Link>
        </div>
      </div>
    </article>
  );
};

const TutorLabel = ({
  label,
  tutor,
}: {
  label: string;
  tutor: { name: string; companionIcon: string } | null;
}) => (
  <span className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base">
      {tutor?.companionIcon ?? (
        <GraduationCap className="size-3.5 text-violet-600" aria-hidden="true" />
      )}
    </span>
    <span className="truncate">
      {label}:{" "}
      <span className="font-semibold text-slate-800">
        {tutor?.name ?? "Unavailable"}
      </span>
    </span>
  </span>
);

export default LessonSessionCard;
