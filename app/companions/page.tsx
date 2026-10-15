import CompanionCard from "@/components/CompanionCard";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const LearningCompanions = async () => {
  const { userId } = await auth();
  const companions = await prisma.companion.findMany({
    where: userId
      ? { OR: [{ userId }, { isPublic: true }] }
      : { isPublic: true },
    include: {
      lessons: {
        select: { id: true, subject: true },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Companions</h1>
            <p className="mt-2 text-slate-600">
              Meet your AI tutors and explore what they teach.
            </p>
          </div>
          <Link
            href="/companions/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <span className="text-lg leading-none">+</span>
            Create Companion
          </Link>
        </div>
      </header>

      {companions.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companions.map((companion) => (
            <CompanionCard key={companion.id} companion={companion} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
          No companions are available yet.
        </p>
      )}
    </main>
  );
};

export default LearningCompanions;