import { getBookmarksAction } from "@/actions/bookmark.action";
import LessonCard from "@/components/LessonCard";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";
import Link from "next/link";

const SavedLessons = async () => {
  const result = await getBookmarksAction();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-60 rounded-full bg-violet-200/35 blur-3xl"
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            <Sparkles className="size-4" aria-hidden="true" />
            Your personal reading list
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Saved lessons
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Keep the lessons you want to come back to close at hand.
          </p>
        </div>
      </header>

      {!result.success ? (
        <section
          role="alert"
          className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            {result.error === "Unauthorized"
              ? "Sign in to see saved lessons"
              : "Saved lessons could not be loaded"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {result.error === "Unauthorized"
              ? "Sign in to keep your bookmarked lessons in one place."
              : result.error}
          </p>
          {result.error === "Unauthorized" && (
            <Link
              href="/sign-in?redirect_url=/bookmarks"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Sign in
            </Link>
          )}
        </section>
      ) : result.data.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <Bookmark className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            No saved lessons
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Bookmark a lesson while browsing and it will be waiting here when
            you are ready.
          </p>
          <Link
            href="/lessons"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Browse lessons
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((bookmark) => (
            <LessonCard
              key={bookmark.id}
              lesson={{
                ...bookmark.lesson,
                bookmarkId: bookmark.id,
              }}
            />
          ))}
        </section>
      )}
    </main>
  );
};

export default SavedLessons;