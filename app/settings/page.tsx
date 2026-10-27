import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

const SettingsPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/settings");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
          Your account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Manage your profile, sign-in methods, and account security.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section
          aria-label="Profile and account settings"
          className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4"
        >
          <UserProfile routing="hash" />
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-bold text-slate-900">
              Your account, your control
            </h2>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              Update your personal details and security settings securely
              through your account profile.
            </p>
          </section>

          <nav
            aria-label="Account shortcuts"
            className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            <Link
              href="/subscription"
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-800"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-slate-400" aria-hidden="true" />
                Plan &amp; billing
              </span>
              <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
            </Link>
            <Link
              href="/companions"
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-800"
            >
              <span className="flex items-center gap-3">
                <UserRound className="size-4 text-slate-400" aria-hidden="true" />
                Your companions
              </span>
              <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
            </Link>
          </nav>
        </aside>
      </div>
    </main>
  );
};

export default SettingsPage;
