import { getLessonSessionsAction } from "@/actions/lesson-session.action";
import LessonSessionCard from "@/components/LessonSessionCard";
import { ArrowLeft, ArrowRight, History } from "lucide-react";
import Link from "next/link";

type LearningSessionsSearchParams = Promise<{
  page?: string | string[];
  status?: string | string[];
}>;

const sessionStatuses = [
  { value: "ALL", label: "All sessions" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ABANDONED", label: "Abandoned" },
] as const;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function sessionsHref(page: number, status: string) {
  const params = new URLSearchParams({ page: String(page), status });
  return `/learning-sessions?${params.toString()}`;
}

const LearningSessionsPage = async ({
  searchParams,
}: {
  searchParams: LearningSessionsSearchParams;
}) => {
  const params = await searchParams;
  const requestedPage = Number(firstValue(params.page));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const requestedStatus = firstValue(params.status)?.toUpperCase() ?? "ALL";
  const status = sessionStatuses.some(
    (option) => option.value === requestedStatus
  )
    ? requestedStatus
    : "ALL";
  const result = await getLessonSessionsAction({
    page,
    limit: 10,
    status,
  });
  const activeStatus =
    sessionStatuses.find((option) => option.value === status) ??
    sessionStatuses[0];
  const currentPage = result.success ? result.data.pagination.page : page;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/my-journey"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            My Journey
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            Your lesson history
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            My Learning Sessions
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review your active, completed, and unfinished voice lessons.
          </p>
        </div>

        <form action="/learning-sessions" className="flex items-end gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Filter sessions
            <select
              name="status"
              defaultValue={status}
              className="mt-2 h-11 min-w-48 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              {sessionStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Apply
          </button>
        </form>
      </header>

      {!result.success ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            {result.error === "Unauthorized"
              ? "Sign in to view your sessions"
              : "Your sessions could not be loaded"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {result.error === "Unauthorized"
              ? "Your learning history is saved to your account."
              : result.error}
          </p>
          {result.error === "Unauthorized" && (
            <Link
              href="/sign-in?redirect_url=/learning-sessions"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Sign in
            </Link>
          )}
        </section>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {result.data.pagination.total}{" "}
            {result.data.pagination.total === 1 ? "session" : "sessions"} ·{" "}
            {activeStatus.label}
          </p>

          {result.data.sessions.length > 0 ? (
            <section className="grid gap-4 lg:grid-cols-2">
              {result.data.sessions.map((session) => (
                <LessonSessionCard key={session.id} session={session} />
              ))}
            </section>
          ) : (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <History className="size-7" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {activeStatus.value === "ALL"
                  ? "No sessions yet"
                  : `No ${activeStatus.label.toLowerCase()} sessions yet`}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {activeStatus.value === "ALL"
                  ? "Start a voice lesson and your session history will appear here."
                  : `There are no ${activeStatus.label.toLowerCase()} sessions to show.`}
              </p>
              <Link
                href="/lessons"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Explore lessons
              </Link>
            </section>
          )}

          {result.data.pagination.totalPages > 1 && (
            <nav
              aria-label="Session pages"
              className="mt-8 flex items-center justify-between"
            >
              {currentPage > 1 ? (
                <Link
                  href={sessionsHref(currentPage - 1, status)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-slate-500">
                Page {currentPage} of{" "}
                {result.data.pagination.totalPages}
              </span>
              {currentPage < result.data.pagination.totalPages ? (
                <Link
                  href={sessionsHref(currentPage + 1, status)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </main>
  );
};

export default LearningSessionsPage;
