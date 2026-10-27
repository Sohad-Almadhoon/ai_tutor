import { getCompanionByIdAction } from "@/actions/companion.action";
import { voiceOptions, voiceProviders } from "@/constants";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Globe2,
  Mic2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type CompanionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const CompanionDetailsPage = async ({
  params,
}: CompanionDetailsPageProps) => {
  const { id } = await params;
  const companionId = Number(id);

  if (!Number.isSafeInteger(companionId) || companionId <= 0) {
    return (
      <CompanionUnavailable
        message="This companion could not be found."
        isUnauthorized={false}
      />
    );
  }

  const result = await getCompanionByIdAction(companionId);

  if (!result.success) {
    return (
      <CompanionUnavailable
        message={result.error}
        isUnauthorized={result.status === 401}
        companionId={companionId}
      />
    );
  }

  const companion = result.data;
  const voice = voiceOptions.find((option) => option.id === companion.voiceId);
  const voiceProvider = voiceProviders.find(
    (provider) => provider.id === companion.voiceProvider
  );
  const speakingStyles = companion.speakingStyle
    .split(",")
    .map((style) => style.trim())
    .filter(Boolean);
  const previewLessons = companion.lessons.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/companions"
        className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All companions
      </Link>

      <header className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-72 rounded-full bg-violet-200/40 blur-3xl"
        />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="flex size-24 shrink-0 items-center justify-center rounded-3xl border border-white bg-white text-6xl shadow-md shadow-violet-950/5 sm:size-28"
          >
            {companion.companionIcon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Your learning companion
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {companion.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {companion.description ||
                `Meet ${companion.name}, your AI tutor. Explore a lesson and start learning together.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/85 px-3 py-1.5 text-xs font-semibold capitalize text-violet-800">
                <Globe2 className="size-3.5" aria-hidden="true" />
                {companion.language}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <BookOpen className="size-3.5" aria-hidden="true" />
                {companion.lessons.length}{" "}
                {companion.lessons.length === 1 ? "lesson" : "lessons"}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  companion.isPublic
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {companion.isPublic ? "Public companion" : "Private companion"}
              </span>
            </div>
          </div>

          <Link
            href={`/companions/${companion.id}/lessons`}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            Explore lessons
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                Start learning
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Lessons with {companion.name}
              </h2>
            </div>
            {companion.lessons.length > 0 && (
              <Link
                href={`/companions/${companion.id}/lessons`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
              >
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {previewLessons.length > 0 ? (
            <ul className="mt-5 divide-y divide-slate-100">
              {previewLessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{lesson.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                      {lesson.topic}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      <span className="capitalize">{lesson.subject}</span>
                      <span aria-hidden="true"> · </span>
                      {lesson.targetDurationMinutes} minutes
                    </p>
                  </div>
                  <span
                    className={`mt-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      lesson.isPublic
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {lesson.isPublic ? "Public" : "Private"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">
                No lessons yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-slate-600">
                There aren&apos;t any lessons available for this companion yet.
              </p>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Mic2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Tutor profile
              </p>
              <h2 className="font-bold text-slate-900">Meet your tutor</h2>
            </div>
          </div>

          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Voice
              </dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                {voice?.name ?? "Custom voice"}
                <span className="font-normal text-slate-500">
                  {voiceProvider ? `· ${voiceProvider.name}` : ""}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Teaching style
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {speakingStyles.length > 0 ? (
                  speakingStyles.map((style) => (
                    <span
                      key={style}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800"
                    >
                      {style}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-600">Not specified</span>
                )}
              </dd>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Joined
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "long",
                }).format(companion.createdAt)}
              </dd>
            </div>
          </dl>

          <Link
            href={`/companions/${companion.id}/lessons`}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-800 transition hover:border-violet-300 hover:bg-violet-100"
          >
            Browse all lessons
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </main>
  );
};

const CompanionUnavailable = ({
  message,
  isUnauthorized,
  companionId,
}: {
  message: string;
  isUnauthorized: boolean;
  companionId?: number;
}) => (
  <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
    <div
      role="alert"
      className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm sm:p-9"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">
        Companion unavailable
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        We couldn&apos;t load this tutor
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      <Link
        href={
          isUnauthorized
            ? `/sign-in?redirect_url=/companions/${companionId ?? ""}`
            : "/companions"
        }
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {isUnauthorized ? "Sign in to continue" : "Back to companions"}
      </Link>
    </div>
  </main>
);

export default CompanionDetailsPage;
