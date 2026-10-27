import { getCompanionsAction } from "@/actions/companion.action";
import { getLessonByIdAction } from "@/actions/lesson.action";
import LessonCallRoom from "@/components/LessonCallRoom";
import { voiceOptions } from "@/constants";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

const LessonsPage = async ({ params }: LessonPageProps) => {
  const { id } = await params;
  const lessonId = Number(id);

  if (!Number.isSafeInteger(lessonId) || lessonId <= 0) {
    return <LessonUnavailable message="This lesson could not be found." />;
  }

  const [lessonResult, companionsResult] = await Promise.all([
    getLessonByIdAction(lessonId),
    getCompanionsAction({ limit: 100 }),
  ]);

  if (!lessonResult.success) {
    return <LessonUnavailable message={lessonResult.error} />;
  }

  if (!companionsResult.success) {
    return <LessonUnavailable message={companionsResult.error} />;
  }

  const lesson = lessonResult.data;
  const companions = companionsResult.data.companions.flatMap((companion) => {
    const voice = voiceOptions.find(
      (option) =>
        option.id === companion.voiceId &&
        option.provider === companion.voiceProvider
    );
    if (!voice) return [];

    return [
      {
        id: companion.id,
        name: companion.name,
        description: companion.description,
        companionIcon: companion.companionIcon,
        language: companion.language,
        speakingStyle: companion.speakingStyle,
        voice,
      },
    ];
  });
  const hasAccessibleDefaultCompanion = companions.some(
    ({ id: companionId }) => companionId === lesson.defaultCompanionId
  );
  const defaultCompanionId = hasAccessibleDefaultCompanion
    ? lesson.defaultCompanionId
    : (companions[0]?.id ?? null);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/lessons"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All lessons
      </Link>

      <header className="mb-7">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-violet-700">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {lesson.subject}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {lesson.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          {lesson.topic}
        </p>
        <p className="mt-3 text-sm font-medium text-slate-500">
          Suggested duration: {lesson.targetDurationMinutes} minutes
        </p>
      </header>

      {companions.length === 0 ? (
        <section
          role="alert"
          className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-900"
        >
          No available tutor has a Vapi-supported voice configured. Create a
          companion with one of the supported voices, then return to this lesson.
          <Link
            href="/companions/new"
            className="mt-4 inline-flex font-semibold text-violet-800 underline underline-offset-4"
          >
            Create a companion
          </Link>
        </section>
      ) : (
        <LessonCallRoom
          lesson={{
            id: lesson.id,
            name: lesson.name,
            topic: lesson.topic,
            subject: lesson.subject,
            targetDurationMinutes: lesson.targetDurationMinutes,
          }}
          companions={companions}
          defaultCompanionId={defaultCompanionId}
          publicKey={process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ""}
          assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? ""}
        />
      )}
    </main>
  );
};

const LessonUnavailable = ({ message }: { message: string }) => (
  <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
    <div
      role="alert"
      className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm"
    >
      <p className="text-sm leading-6 text-red-700">{message}</p>
      <Link
        href="/lessons"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to lessons
      </Link>
    </div>
  </main>
);

export default LessonsPage;
