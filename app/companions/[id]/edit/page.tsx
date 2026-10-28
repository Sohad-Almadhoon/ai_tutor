import { getCompanionByIdAction } from "@/actions/companion.action";
import CompanionEditForm from "@/components/CompanionEditForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type CompanionEditPageProps = {
  params: Promise<{ id: string }>;
};

const CompanionEditPage = async ({ params }: CompanionEditPageProps) => {
  const { id } = await params;
  const companionId = Number(id);

  if (!Number.isSafeInteger(companionId) || companionId <= 0) {
    return <CompanionEditUnavailable message="This companion could not be found." />;
  }

  const result = await getCompanionByIdAction(companionId);
  if (!result.success || !result.data.isOwned) {
    return (
      <CompanionEditUnavailable
        message={
          result.success
            ? "This companion could not be found."
            : result.error
        }
        backHref={
          !result.success && result.status === 401
            ? `/sign-in?redirect_url=/companions/${companionId}/edit`
            : "/companions"
        }
        backLabel={
          !result.success && result.status === 401
            ? "Sign in"
            : "Back to companions"
        }
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/companions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to companions
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
          Companion settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit companion
        </h1>
      </header>
      <CompanionEditForm companion={result.data} />
    </main>
  );
};

const CompanionEditUnavailable = ({
  message,
  backHref = "/companions",
  backLabel = "Back to companions",
}: {
  message: string;
  backHref?: string;
  backLabel?: string;
}) => (
  <main className="mx-auto w-full max-w-3xl px-5 py-10">
    <Link
      href={backHref}
      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {backLabel}
    </Link>
    <p role="alert" className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
      {message}
    </p>
  </main>
);

export default CompanionEditPage;
