import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";
import Link from "next/link";

// Example of gating a page behind a paid plan.
// "pro" must match a plan key you create in Clerk Dashboard → Billing → Plans.
export default async function PremiumPage() {
  const { userId, has } = await auth();

  if (!userId) redirect("/sign-in");
  if (!has({ plan: "pro" })) redirect("/subscription");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-5 py-10 sm:px-8">
      <section className="relative w-full overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-7 sm:p-12">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-64 rounded-full bg-violet-200/35 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <BadgeCheck className="size-4" aria-hidden="true" />
            Pro member
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your next level starts here.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            You have access to Learnova premium content. Keep exploring and
            building your skills with your AI tutors.
          </p>
          <Link
            href="/lessons"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
          >
            Explore lessons
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
