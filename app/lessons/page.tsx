import Link from "next/link";
import { discoverLessonsAction } from "@/actions/lesson.action";
import LessonCard from "@/components/LessonCard";
import { subjects } from "@/constants";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

type LessonsSearchParams = Promise<{
  page?: string | string[];
  subject?: string | string[];
  title?: string | string[];
}>;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function lessonsHref(page: number, title: string, subject: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (title) params.set("title", title);
  if (subject) params.set("subject", subject);
  return `/lessons?${params.toString()}`;
}

const LessonsPage = async ({
  searchParams,
}: {
  searchParams: LessonsSearchParams;
}) => {
  const params = await searchParams;
  const requestedPage = Number(firstValue(params.page));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const title = firstValue(params.title)?.trim() ?? "";
  const requestedSubject = firstValue(params.subject)?.toLowerCase() ?? "";
  const subject = subjects.find((option) => option === requestedSubject) ?? "";
  const result = await discoverLessonsAction({
    page,
    limit: 12,
    title,
    subject,
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative mb-7 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-60 rounded-full bg-violet-200/35 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              <Sparkles className="size-4" aria-hidden="true" />
              Pick a topic, start a conversation
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Learning Lessons
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Explore bite-sized lessons and learn them in a live conversation
              with an AI tutor.
            </p>
          </div>
          <Link
            href="/lessons/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Create Lesson
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <form
        action="/lessons"
        className="mb-7 grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-[1fr_12rem_auto_auto] sm:items-end sm:p-5"
      >
        <label className="text-sm font-medium text-slate-700">
          Search lessons
          <input
            type="search"
            name="title"
            defaultValue={title}
            placeholder="Search title, topic, or tutor"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Subject
          <select
            name="subject"
            defaultValue={subject}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="">All subjects</option>
            {subjects.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
        >
          Search
        </button>
        {(title || subject) && (
          <Link
            href="/lessons"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      {!result.success ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            {result.error === "Unauthorized"
              ? "Sign in to explore lessons"
              : "Lessons could not be loaded"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {result.error === "Unauthorized"
              ? "Sign in to discover lessons, save favorites, and start a voice session."
              : result.error}
          </p>
          {result.error === "Unauthorized" && (
            <Link
              href="/sign-in?redirect_url=/lessons"
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
            {result.data.pagination.total === 1 ? "lesson" : "lessons"} found
          </p>
          {result.data.lessons.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {title || subject ? "No matching lessons" : "No lessons yet"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {title || subject
                  ? "Try a different search or clear your filters."
                  : "Create a lesson to start building a reusable learning experience."}
              </p>
            </section>
          ) : (
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {result.data.lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </section>
          )}

          {result.data.pagination.totalPages > 1 && (
            <nav
              aria-label="Lesson pages"
              className="mt-8 flex items-center justify-between"
            >
              {page > 1 ? (
                <Link
                  href={lessonsHref(page - 1, title, subject)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-slate-500">
                Page {result.data.pagination.page} of{" "}
                {result.data.pagination.totalPages}
              </span>
              {page < result.data.pagination.totalPages ? (
                <Link
                  href={lessonsHref(page + 1, title, subject)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
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

export default LessonsPage;