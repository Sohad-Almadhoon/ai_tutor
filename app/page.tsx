import { ArrowRight, BookOpen, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16 sm:px-10">
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-7 py-12 sm:px-14 sm:py-16">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 size-80 rounded-full bg-violet-200/40 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Meet your next favorite tutor
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl">
            Learn out loud
            <span className="block text-violet-600">with Learnova.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Curious questions become real conversations. Find a lesson, meet
            your AI tutor, and make learning feel personal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/lessons"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              Explore lessons
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/companions"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-violet-200 bg-white px-5 text-sm font-semibold text-violet-800 transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Meet the tutors
            </Link>
            <a
              href="https://ai-tutor-nine-snowy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              Visit Learnova
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
