import { PricingTable } from "@clerk/nextjs";
import { BadgeCheck, Sparkles } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 size-60 rounded-full bg-violet-200/35 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            <Sparkles className="size-4" aria-hidden="true" />
            Learn at your own pace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Plans &amp; billing
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Choose the plan that gives you the right tools for your learning
            journey.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <BadgeCheck className="size-4 text-violet-500" aria-hidden="true" />
            Secure subscription management
          </p>
        </div>
      </header>
      <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-6">
        <PricingTable />
      </section>
    </main>
  );
}
