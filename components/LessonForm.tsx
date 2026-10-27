"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  Sparkles,
  UserRound,
} from "lucide-react";
import { subjects } from "@/constants";
import { createLessonAction } from "@/actions/lesson.action";
import { getCompanionsAction } from "@/actions/companion.action";
import { useToast } from "@/components/ToastProvider";

const subjectLabels: Record<string, string> = {
  maths: "Maths",
  language: "Language",
  science: "Science",
  history: "History",
  coding: "Coding",
  economics: "Economics",
};
type Companion = {
  id: number;
  name: string;
  companionIcon: string;
  speakingStyle: string;
  isPublic: boolean;
  isOwned: boolean;
};

const initialForm = {
  lessonName: "",
  topic: "",
  subject: "",
  targetDurationMinutes: 20,
  companionId: null as number | null,
  isPublic: false,
};

type FormState = {
  lessonName: string;
  topic: string;
  subject: string;
  targetDurationMinutes: number;
  companionId: number | null;
  isPublic: boolean;
};

const steps = [
  { title: "Lesson details", icon: BookOpen },
  { title: "Choose a tutor", icon: UserRound },
  { title: "Review", icon: CheckCircle2 },
];

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-300 aria-invalid:focus:ring-red-100";

const LessonForm = () => {
  const router = useRouter();
  const showToast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [availableCompanions, setAvailableCompanions] = useState<Companion[]>([]);
  const [isLoadingCompanions, setIsLoadingCompanions] = useState(true);
  const [companionLoadError, setCompanionLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCompanion = useMemo(
    () => availableCompanions.find((c) => c.id === form.companionId),
    [availableCompanions, form.companionId]
  );

  useEffect(() => {
    let isActive = true;

    const loadCompanions = async () => {
      setIsLoadingCompanions(true);
      setCompanionLoadError("");

      try {
        const result = await getCompanionsAction({ limit: 100 });
        if (!result.success) throw new Error(result.error);

        const companions = result.data.companions.map((companion) => ({
          id: companion.id,
          name: companion.name,
          companionIcon: companion.companionIcon,
          speakingStyle: companion.speakingStyle,
          isPublic: companion.isPublic,
          isOwned: companion.isOwned,
        }));

        if (isActive) {
          setAvailableCompanions(companions);
          setForm((current) => ({
            ...current,
            companionId: current.companionId ?? companions[0]?.id ?? null,
          }));
        }
      } catch (caughtError) {
        if (isActive) {
          setCompanionLoadError(
            caughtError instanceof Error
              ? caughtError.message
              : "We couldn't load companions. Please try again."
          );
        }
      } finally {
        if (isActive) setIsLoadingCompanions(false);
      }
    };

    void loadCompanions();

    return () => {
      isActive = false;
    };
  }, []);

  const updateForm = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError("");
  };

  const validateStep = (stepToValidate = step) => {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (stepToValidate === 0) {
      if (!form.lessonName.trim()) errors.lessonName = "Please add a title for the lesson.";
      if (!form.subject.trim()) errors.subject = "Please choose a subject.";
      if (!form.topic.trim()) errors.topic = "Please describe what learners will study.";
    }

    if (stepToValidate === 1) {
      if (!form.targetDurationMinutes || form.targetDurationMinutes <= 0) {
        errors.targetDurationMinutes = "Please choose a session length.";
      }
      if (!form.companionId || !selectedCompanion) {
        errors.companionId = "Please choose a tutor for your first session.";
      }
    }

    return errors;
  };

  const goNext = () => {
    const errors = validateStep();

    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitForm = async () => {
    const errors = {
      ...validateStep(0),
      ...validateStep(1),
    };

    if (Object.keys(errors).length > 0 || !form.companionId) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await createLessonAction({
        name: form.lessonName.trim(),
        topic: form.topic.trim(),
        subject: form.subject,
        targetDurationMinutes: form.targetDurationMinutes,
        defaultCompanionId: form.companionId,
        isPublic: form.isPublic,
      });

      if (!result.success) throw new Error(result.error);

      showToast("success", "Lesson created successfully.");
      router.push("/lessons");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "We couldn't create your lesson. Please try again.";
      setSubmitError(message);
      showToast("error", message);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-violet-100/70 via-[#f8f9fd] to-[#f8f9fd] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/lessons"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <ChevronLeft className="size-4" />
          Back to lessons
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200 sm:flex">
            <BookOpen className="size-7" />
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Lesson builder
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Create a lesson
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Create a lesson learners can explore with the AI companion that suits them.
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_70px_-45px_rgba(40,35,90,0.4)] sm:p-8">
        <ol
          aria-label="Lesson creation progress"
          className="mb-8 grid grid-cols-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-2 py-4 sm:px-5"
        >
          {steps.map(({ title, icon: Icon }, index) => {
            const isComplete = index < step;
            const isCurrent = index === step;

            return (
              <li
                key={title}
                aria-current={isCurrent ? "step" : undefined}
                className="relative flex flex-col items-center gap-2 text-center"
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute right-1/2 top-5 h-0.5 w-full transition-colors ${
                      isComplete ? "bg-violet-500" : "bg-slate-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition sm:size-11 ${
                    isCurrent || isComplete
                      ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isComplete ? <Check className="size-5" /> : <Icon className="size-4" />}
                </span>
                <span
                  className={`text-[11px] font-medium sm:text-xs ${
                    isCurrent ? "text-violet-700" : isComplete ? "text-slate-700" : "text-slate-500"
                  }`}
                >
                  {title}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {step === 0 && "Lesson details"}
              {step === 1 && "Choose a tutor"}
              {step === 2 && "Review your lesson"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {step === 0 && "Set a clear title, subject, and learning focus."}
              {step === 1 && "Choose a companion for your first session. The lesson itself stays independent."}
              {step === 2 && "Check the lesson details and the companion selected for your first session."}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </span>
        </div>

        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lesson-name" className="text-sm font-semibold text-slate-800">
                Lesson title <span className="text-red-500">*</span>
              </label>
              <input
                id="lesson-name"
                type="text"
                value={form.lessonName}
                onChange={(event) => updateForm("lessonName", event.target.value)}
                className={fieldClassName}
                placeholder="e.g. Understanding linear equations"
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.lessonName)}
                aria-describedby={fieldErrors.lessonName ? "lesson-name-error" : undefined}
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Give learners a short, clear idea of what they&apos;ll study.
              </p>
              {fieldErrors.lessonName && (
                <p id="lesson-name-error" className="mt-1 text-sm text-red-600">
                  {fieldErrors.lessonName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lesson-subject" className="text-sm font-semibold text-slate-800">
                Subject area <span className="text-red-500">*</span>
              </label>
              <select
                id="lesson-subject"
                value={form.subject}
                onChange={(event) => updateForm("subject", event.target.value)}
                className={fieldClassName}
                aria-invalid={Boolean(fieldErrors.subject)}
                aria-describedby={fieldErrors.subject ? "lesson-subject-error" : undefined}
              >
                <option value="">Choose a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subjectLabels[subject]}
                  </option>
                ))}
              </select>
              {fieldErrors.subject && (
                <p id="lesson-subject-error" className="mt-1 text-sm text-red-600">
                  {fieldErrors.subject}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="lesson-topic" className="text-sm font-semibold text-slate-800">
                Learning focus <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Describe the key concepts, questions, or skills the lesson covers.
              </p>
              <textarea
                id="lesson-topic"
                rows={4}
                value={form.topic}
                onChange={(event) => updateForm("topic", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 aria-invalid:border-red-300 aria-invalid:focus:ring-red-100"
                placeholder="For example: learners will solve linear equations and check their solutions."
                aria-invalid={Boolean(fieldErrors.topic)}
                aria-describedby={fieldErrors.topic ? "lesson-topic-error" : undefined}
              />
              {fieldErrors.topic && (
                <p id="lesson-topic-error" className="mt-1 text-sm text-red-600">
                  {fieldErrors.topic}
                </p>
              )}
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-200 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) => updateForm("isPublic", event.target.checked)}
                className="mt-0.5 size-4 accent-violet-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Share this lesson publicly
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Public lessons can be discovered and used by other learners. You can keep it private and change your mind later.
                </span>
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-violet-600" />
                <p className="text-sm font-semibold text-slate-800">
                  Suggested session length
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Learners can adjust this when they start a session.
              </p>
              <div
                className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5"
                role="group"
                aria-label="Suggested session length"
                aria-describedby={
                  fieldErrors.targetDurationMinutes ? "lesson-duration-error" : undefined
                }
              >
                {[10, 20, 30, 45, 60].map((duration) => {
                  const isSelected = form.targetDurationMinutes === duration;

                  return (
                    <button
                      key={duration}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => updateForm("targetDurationMinutes", duration)}
                      className={`h-11 rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 ${
                        isSelected
                          ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-200"
                          : fieldErrors.targetDurationMinutes
                            ? "border-red-300 bg-white text-slate-700 hover:border-red-400"
                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                      }`}
                    >
                      {duration} min
                    </button>
                  );
                })}
              </div>
              {fieldErrors.targetDurationMinutes && (
                <p id="lesson-duration-error" className="mt-1 text-sm text-red-600">
                  {fieldErrors.targetDurationMinutes}
                </p>
              )}
            </div>

            <div>
              <p id="companion-label" className="text-sm font-semibold text-slate-800">
                Choose a companion for your first session
              </p>
              <p className="mt-1 text-xs text-slate-500">
                You can pick another companion when you start a future session.
              </p>
              {isLoadingCompanions ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Loading companions…
                </p>
              ) : companionLoadError ? (
                <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {companionLoadError}
                </p>
              ) : availableCompanions.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center">
                  <UserRound className="mx-auto size-7 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    No companions available yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create your own companion or try again later.
                  </p>
                  <Link
                    href="/companions/new"
                    className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Create a companion
                  </Link>
                </div>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableCompanions.map((companion) => {
                  const isSelected = form.companionId === companion.id;

                  return (
                    <button
                      key={companion.id}
                      type="button"
                      aria-pressed={isSelected}
                      aria-describedby={
                        fieldErrors.companionId ? "companion-error" : "companion-label"
                      }
                      onClick={() => updateForm("companionId", companion.id)}
                      className={`group rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 ${
                        isSelected
                          ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
                          : "border-slate-200 bg-white hover:border-violet-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`mb-3 flex size-12 items-center justify-center rounded-2xl text-2xl transition ${
                            isSelected
                              ? "bg-white shadow-sm"
                              : "bg-slate-50 group-hover:bg-violet-50"
                          }`}
                        >
                          {companion.companionIcon}
                        </div>
                        {isSelected && <CheckCircle2 className="size-5 text-violet-600" />}
                      </div>
                      <div className="text-base font-semibold text-slate-900">
                        {companion.name}
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {companion.speakingStyle}
                      </div>
                      <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {companion.isOwned ? "Your companion" : "Community companion"}
                      </span>
                    </button>
                  );
                })}
                </div>
              )}
              {fieldErrors.companionId && (
                <p id="companion-error" className="mt-1 text-sm text-red-600">
                  {fieldErrors.companionId}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
            <div className="flex items-center gap-3 bg-violet-600 px-5 py-4 text-white">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">Lesson summary</h3>
                <p className="text-xs text-violet-100">Review before you create it</p>
              </div>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">Lesson title</dt>
                <dd className="mt-1 font-semibold text-slate-900">{form.lessonName || "Untitled lesson"}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">Subject</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {form.subject ? subjectLabels[form.subject] : "Not selected"}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500">Learning focus</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {form.topic || "No learning focus added yet"}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">Suggested session length</dt>
                <dd className="mt-1 font-semibold text-slate-900">{form.targetDurationMinutes} minutes</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-medium text-slate-500">First-session tutor</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {selectedCompanion
                    ? `${selectedCompanion.companionIcon} ${selectedCompanion.name}`
                    : "No tutor selected"}
                </dd>
              </div>
            </dl>
            <p className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-3 text-sm leading-5 text-violet-800">
              <UserRound className="mt-0.5 size-4 shrink-0" />
              The lesson content is independent of the tutor. Learners can choose a different companion for another session.
            </p>
          </div>
        )}

        {submitError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => {
              setFieldErrors({});
              setStep((current) => Math.max(current - 1, 0));
            }}
            disabled={step === 0}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="size-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={
              step === steps.length - 1
                ? submitForm
                : goNext
            }
            disabled={isSubmitting || (step === 1 && isLoadingCompanions)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating..."
              : step === steps.length - 1
                ? "Create lesson"
                : "Continue"}
            <ArrowRight className="size-4" />
          </button>
        </div>
        </section>
      </div>
    </main>
  );
};

export default LessonForm;