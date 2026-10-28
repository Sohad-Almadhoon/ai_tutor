import { getLessonByIdAction } from "@/actions/lesson.action";
import LessonEditForm from "@/components/LessonEditForm";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type LessonEditPageProps = {
  params: Promise<{ id: string }>;
};

const LessonEditPage = async ({ params }: LessonEditPageProps) => {
  const { id } = await params;
  const lessonId = Number(id);
  const { userId } = await auth();

  if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
    return <LessonEditUnavailable message="This lesson could not be found." />;
  }
  if (!userId) {
    return (
      <LessonEditUnavailable
        message="Sign in to edit your lesson."
        backHref={`/sign-in?redirect_url=/lessons/${lessonId}/edit`}
        backLabel="Sign in"
      />
    );
  }

  const result = await getLessonByIdAction(lessonId);
  if (!result.success || result.data.createdById !== userId) {
    return <LessonEditUnavailable message="This lesson could not be found." />;
  }

  const lesson = result.data;
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/lessons"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to lessons
      </Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
          Lesson settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit lesson
        </h1>
      </header>
      <LessonEditForm lesson={lesson} />
    </main>
  );
};

const LessonEditUnavailable = ({
  message,
  backHref = "/lessons",
  backLabel = "Back to lessons",
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

export default LessonEditPage;
