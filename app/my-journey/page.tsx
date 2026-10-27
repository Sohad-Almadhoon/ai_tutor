import {
  getLessonSessionOverviewAction,
  getLessonSessionsAction,
} from "@/actions/lesson-session.action";
import LessonSessionCard from "@/components/LessonSessionCard";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Flame,
} from "lucide-react";
import Link from "next/link";

const MyJourneyPage = async () => {
  const [overviewResult, sessionsResult] = await Promise.all([
    getLessonSessionOverviewAction(),
    getLessonSessionsAction({ limit: 6, status: "COMPLETED" }),
  ]);

  if (!overviewResult.success || !sessionsResult.success) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          My Journey
        </h1>
        <p
          role="alert"
          className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"
        >
          {!overviewResult.success
            ? overviewResult.error
            : !sessionsResult.success
              ? sessionsResult.error
              : "Your learning journey could not be loaded."}
        </p>
        {((!overviewResult.success && overviewResult.error === "Unauthorized") ||
          (!sessionsResult.success && sessionsResult.error === "Unauthorized")) && (
          <Link
            href="/sign-in?redirect_url=/my-journey"
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Sign in to view your journey
          </Link>
        )}
      </main>
    );
  }

  const { total, completed, inProgress, abandoned, durationSeconds } =
    overviewResult.data;
  const totalMinutes = Math.floor(durationSeconds / 60);
  const stats = [
    {
      label: "Sessions completed",
      value: completed,
      icon: BookOpenCheck,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Time spent learning",
      value: `${totalMinutes} min`,
      icon: Clock3,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: Activity,
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "Sessions started",
      value: total,
      icon: Flame,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-64 rounded-full bg-violet-200/30 blur-3xl"
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Your progress
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            My Journey
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Every session is a step forward. Here&apos;s a look at the learning
            you&apos;ve done with your AI tutors.
          </p>
          <Link
            href="/lessons"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            Find a lesson
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section
        aria-label="Learning statistics"
        className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map(({ label, value, icon: Icon, color }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recently completed
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest finished learning sessions.
            </p>
          </div>
          <Link
            href="/learning-sessions?status=COMPLETED"
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            All sessions
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {sessionsResult.data.sessions.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {sessionsResult.data.sessions.map((session) => (
              <LessonSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <BookOpenCheck className="size-7" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Your journey starts here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Complete your first voice lesson and it will show up here along
              with your learning stats.
            </p>
            <Link
              href="/lessons"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Explore lessons
            </Link>
          </div>
        )}
      </section>

      {abandoned > 0 && (
        <p className="mt-6 text-sm text-slate-500">
          You can find {abandoned}{" "}
          {abandoned === 1 ? "unfinished session" : "unfinished sessions"} in{" "}
          <Link
            href="/learning-sessions?status=ABANDONED"
            className="font-semibold text-violet-700 hover:text-violet-900"
          >
            My Learning Sessions
          </Link>
          .
        </p>
      )}
    </main>
  );
};

export default MyJourneyPage;