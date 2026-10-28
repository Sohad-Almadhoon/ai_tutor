import { getCompanionLessonsAction } from "@/actions/lesson.action";
import LessonCard from "@/components/LessonCard";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

type CompanionLessonsPageProps = {
  params: Promise<{ id: string }>;
};

const CompanionLessonsPage = async ({
  params,
}: CompanionLessonsPageProps) => {
  const { id } = await params;
  const companionId = Number(id);

  if (!Number.isSafeInteger(companionId) || companionId <= 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          This companion could not be found.
        </p>
      </main>
    );
  }

  const result = await getCompanionLessonsAction(companionId);

  if (!result.success) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Link
          href={
            result.status === 401
              ? `/sign-in?redirect_url=/companions/${companionId}/lessons`
              : "/companions"
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {result.status === 401 ? "Sign in to continue" : "All companions"}
        </Link>
        <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {result.error}
        </p>
      </main>
    );
  }

  const { companion, lessons } = result.data;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <Link
        href="/companions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All companions
      </Link>

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 size-64 rounded-full bg-violet-200/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl border border-white bg-white text-5xl shadow-sm">
            {companion.companionIcon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              <Sparkles className="size-4" aria-hidden="true" />
              Learning with
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {companion.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {companion.description ||
                `Explore lessons selected for learning with ${companion.name}.`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-xs font-semibold capitalize text-violet-800">
                {companion.language}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                <BookOpen className="size-3.5" aria-hidden="true" />
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
          </div>
          <Link
            href="/lessons/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
          >
            Create a lesson
          </Link>
        </div>
      </header>

      {lessons.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <BookOpen className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No lessons to show yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Lessons for this companion will appear here once they are available.
            You can create a lesson and choose a tutor for it.
          </p>
          <Link
            href="/lessons/new"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            Create a lesson
          </Link>
        </section>
      ) : (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Available lessons</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick a topic and start learning at your own pace.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={{
                  ...lesson,
                  isOwned: lesson.isOwned,
                  bookmarkId: null,
                  defaultCompanion: {
                    name: companion.name,
                    companionIcon: companion.companionIcon,
                  },
                }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CompanionLessonsPage;
