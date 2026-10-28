import CompanionCard from "@/components/CompanionCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Sparkles, UsersRound } from "lucide-react";

const LearningCompanions = async () => {
  const { userId } = await auth();
  const companions = await prisma.companion.findMany({
    where: userId ? { OR: [{ userId }, { isPublic: true }] } : { isPublic: true },
    include: {
      defaultLessons: {
        where: userId
          ? { OR: [{ createdById: userId }, { isPublic: true }] }
          : { isPublic: true },
        select: { id: true, subject: true },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-60 rounded-full bg-violet-200/35 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              <Sparkles className="size-4" aria-hidden="true" />
              Find your learning partner
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Learning Companions
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Meet AI tutors with their own teaching style, voice, and favorite
              subjects.
            </p>
          </div>
          <Link
            href="/companions/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <UsersRound className="size-4" aria-hidden="true" />
            Create Companion
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {companions.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              isOwned={companion.userId === userId}
              companion={{ ...companion, lessons: companion.defaultLessons }}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
            <UsersRound className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Your tutor lineup starts here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Create a companion to build a personalized tutor and its first
            lesson.
          </p>
          <Link
            href="/companions/new"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Create your first companion
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      )}
    </main>
  );
};

export default LearningCompanions;