"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  AudioLines,
  BookOpen,
  Check,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  Mic2,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  companionAvatars,
  languages,
  lessonDurations,
  subjects,
  voiceOptions,
  voiceProviders,
  speakingStyles,
} from "@/constants";
import { createCompanionDescription } from "@/lib/companion-description";
import Link from "next/link";
import { createCompanionAction } from "@/actions/companion.action";

const steps = [
  { title: "Basic Info", icon: BookOpen },
  { title: "Personality", icon: UserRound },
  { title: "Voice & Language", icon: AudioLines },
  { title: "Review", icon: CheckCircle2 },
];

const subjectLabels: Record<string, string> = {
  maths: "Maths",
  language: "Language",
  science: "Science",
  history: "History",
  coding: "Coding",
  economics: "Economics",
};

const initialForm = {
  name: "",
  companionIcon: companionAvatars[0],
  lessonName: "",
  topic: "",
  subject: "",
  targetDurationMinutes: 20,
  speakingStyles: ["Friendly", "Patient"],
  voiceProvider: voiceProviders[0].id,
  voiceId: voiceOptions[0].id,
  language: languages[0],
  isPublic: true,
};

type FormState = {
  name: string;
  companionIcon: string;
  lessonName: string;
  topic: string;
  subject: string;
  targetDurationMinutes: number;
  speakingStyles: string[];
  voiceProvider: string;
  voiceId: string;
  language: string;
  isPublic: boolean;
};

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

const CompanionForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVoice =
    voiceOptions.find(
      (voice) =>
        voice.provider === form.voiceProvider && voice.id === form.voiceId
    ) ?? voiceOptions[0];
  const speakingStyle = form.speakingStyles.join(", ");
  const description = createCompanionDescription(
    form.name.trim() || "Your companion",
    speakingStyle
  );

  const updateForm = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Add a name for your companion.";
      if (!form.lessonName.trim()) return "Add a name for the first lesson.";
      if (!form.topic.trim()) return "Add a topic for the first lesson.";
      if (!form.subject) return "Choose the subject your companion will teach.";
    }

    if (step === 1 && form.speakingStyles.length === 0) {
      return "Choose at least one teaching style.";
    }

    if (step === 2 && (!form.language || !selectedVoice)) {
      return "Choose a language and voice for your companion.";
    }

    return "";
  };

  const goNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const createCompanion = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await createCompanionAction({
          name: form.name.trim(),
          companionIcon: form.companionIcon,
          voiceProvider: form.voiceProvider,
          voiceId: form.voiceId,
          language: form.language,
          speakingStyle,
          isPublic: form.isPublic,
          lesson: {
            name: form.lessonName.trim(),
            topic: form.topic.trim(),
            subject: form.subject,
            targetDurationMinutes: form.targetDurationMinutes,
          },
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push("/companions");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We couldn't create your companion. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const toggleStyle = (style: string) => {
    setForm((current) => ({
      ...current,
      speakingStyles: current.speakingStyles.includes(style)
        ? current.speakingStyles.filter((selected) => selected !== style)
        : [...current.speakingStyles, style],
    }));
    setError("");
  };

  const chooseProvider = (provider: (typeof voiceProviders)[number]["id"]) => {
    const firstVoice = voiceOptions.find((voice) => voice.provider === provider);
    setForm((current) => ({
      ...current,
      voiceProvider: provider,
      voiceId: firstVoice?.id ?? "",
    }));
    setError("");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f8f9fd] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/companions"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <ChevronLeft className="size-4" />
          Back to companions
        </Link>

        <div className="mb-7">
          <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">
            Your teaching studio
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Create a Companion
          </h1>
          <p className="mt-2 text-slate-600">
            Design an AI tutor with its own personality, voice, and first lesson.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.85fr)]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_-40px_rgba(40,35,90,0.35)] sm:p-8">
            <ol
              aria-label="Companion creation progress"
              className="mb-8 grid grid-cols-4"
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
                        className={`absolute right-1/2 top-5 h-0.5 w-full ${
                          isComplete ? "bg-violet-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        isCurrent || isComplete
                          ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {isComplete ? <Check className="size-5" /> : <Icon className="size-4" />}
                    </span>
                    <span
                      className={`text-[11px] font-medium sm:text-xs ${
                        isCurrent ? "text-violet-700" : "text-slate-500"
                      }`}
                    >
                      {title}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mb-6">
              <p className="text-xs font-semibold text-violet-600">
                STEP {step + 1} OF {steps.length}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {step === 0 && "The basics"}
                {step === 1 && "Personality & teaching style"}
                {step === 2 && "Voice & language"}
                {step === 3 && "Review & create"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {step === 0 && "Give your tutor a name and its first lesson."}
                {step === 1 && "Choose the qualities that make this tutor unique."}
                {step === 2 && "Pick how your companion sounds and communicates."}
                {step === 3 && "Everything look right? Your tutor is ready to meet learners."}
              </p>
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="companion-name" className="text-sm font-semibold text-slate-800">
                    Companion name
                  </label>
                  <input
                    id="companion-name"
                    autoComplete="off"
                    maxLength={100}
                    placeholder="e.g. Luna the Curious Guide"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    className={fieldClassName}
                  />
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    Choose an avatar
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {companionAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        aria-label={`Choose ${avatar} avatar`}
                        aria-pressed={form.companionIcon === avatar}
                        onClick={() => updateForm("companionIcon", avatar)}
                        className={`flex size-14 items-center justify-center rounded-2xl border text-2xl transition ${
                          form.companionIcon === avatar
                            ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
                            : "border-slate-200 bg-white hover:border-violet-300"
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="size-5 text-violet-600" />
                    <h3 className="font-semibold text-slate-900">First lesson</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="lesson-name" className="text-sm font-medium text-slate-700">
                        Lesson name
                      </label>
                      <input
                        id="lesson-name"
                        maxLength={100}
                        placeholder="e.g. A tour of the solar system"
                        value={form.lessonName}
                        onChange={(event) => updateForm("lessonName", event.target.value)}
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="lesson-subject" className="text-sm font-medium text-slate-700">
                        Subject
                      </label>
                      <select
                        id="lesson-subject"
                        value={form.subject}
                        onChange={(event) => updateForm("subject", event.target.value)}
                        className={fieldClassName}
                      >
                        <option value="">Choose a subject</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subjectLabels[subject]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="lesson-topic" className="text-sm font-medium text-slate-700">
                        What will learners explore?
                      </label>
                      <textarea
                        id="lesson-topic"
                        maxLength={500}
                        rows={2}
                        placeholder="Describe the topic or key idea this lesson covers..."
                        value={form.topic}
                        onChange={(event) => updateForm("topic", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                    <div>
                      <label htmlFor="lesson-duration" className="text-sm font-medium text-slate-700">
                        Suggested duration
                      </label>
                      <select
                        id="lesson-duration"
                        value={form.targetDurationMinutes}
                        onChange={(event) =>
                          updateForm("targetDurationMinutes", Number(event.target.value))
                        }
                        className={fieldClassName}
                      >
                        {lessonDurations.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration} minutes
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <span className="flex items-start gap-3">
                    {form.isPublic ? (
                      <UsersRound className="mt-0.5 size-5 text-violet-600" />
                    ) : (
                      <LockKeyhole className="mt-0.5 size-5 text-slate-500" />
                    )}
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        {form.isPublic ? "Share with learners" : "Keep companion private"}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {form.isPublic
                          ? "Other learners can discover this tutor and its lessons."
                          : "Only you can discover and use this tutor."}
                      </span>
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(event) => updateForm("isPublic", event.target.checked)}
                    className="size-5 accent-violet-600"
                  />
                </label>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="mb-4 text-sm text-slate-600">
                  Choose one or more traits. We will use them to write a friendly tutor
                  description automatically.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {speakingStyles.map((style) => {
                    const selected = form.speakingStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleStyle(style)}
                        className={`flex min-h-14 items-center justify-between rounded-xl border px-4 text-left text-sm font-medium transition ${
                          selected
                            ? "border-violet-400 bg-violet-50 text-violet-800 ring-2 ring-violet-100"
                            : "border-slate-200 text-slate-700 hover:border-violet-200 hover:bg-slate-50"
                        }`}
                      >
                        {style}
                        <span
                          className={`flex size-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="size-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 rounded-2xl bg-violet-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                    Description preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    Voice provider
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {voiceProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        aria-pressed={form.voiceProvider === provider.id}
                        onClick={() => chooseProvider(provider.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          form.voiceProvider === provider.id
                            ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                            : "border-slate-200 hover:border-violet-200"
                        }`}
                      >
                        <Mic2
                          className={`mb-3 size-5 ${
                            form.voiceProvider === provider.id
                              ? "text-violet-600"
                              : "text-slate-400"
                          }`}
                        />
                        <span className="block text-sm font-semibold text-slate-900">
                          {provider.name}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {provider.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">
                    Choose a voice
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {voiceOptions
                      .filter((voice) => voice.provider === form.voiceProvider)
                      .map((voice) => {
                        const selected = voice.id === form.voiceId;
                        return (
                          <button
                            key={voice.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => updateForm("voiceId", voice.id)}
                            className={`rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                                : "border-slate-200 hover:border-violet-200"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-semibold text-slate-900">{voice.name}</span>
                              {selected && <CheckCircle2 className="size-5 text-violet-600" />}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {voice.description}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                  {selectedVoice && (
                    <p className="mt-3 text-xs text-slate-500">
                      Voice selection is saved for Vapi. Live audio preview will be available
                      when a Vapi call is started.
                    </p>
                  )}
                </fieldset>

                <div>
                  <label htmlFor="companion-language" className="text-sm font-semibold text-slate-800">
                    Teaching language
                  </label>
                  <span className="mt-1 block text-xs text-slate-500">
                    The language your tutor will use to teach.
                  </span>
                  <select
                    id="companion-language"
                    value={form.language}
                    onChange={(event) => updateForm("language", event.target.value)}
                    className={fieldClassName}
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <ReviewSection
                  icon={<BookOpen className="size-4" />}
                  title="Basic information"
                  onEdit={() => setStep(0)}
                >
                  <ReviewRow label="Name" value={form.name} />
                  <ReviewRow label="Subject" value={subjectLabels[form.subject] ?? ""} />
                  <ReviewRow label="First lesson" value={form.lessonName} />
                  <ReviewRow label="Topic" value={form.topic} />
                  <ReviewRow
                    label="Duration"
                    value={`${form.targetDurationMinutes} minutes`}
                  />
                  <ReviewRow
                    label="Visibility"
                    value={form.isPublic ? "Public" : "Private"}
                  />
                </ReviewSection>
                <ReviewSection
                  icon={<Sparkles className="size-4" />}
                  title="Personality & teaching style"
                  onEdit={() => setStep(1)}
                >
                  <ReviewRow label="Teaching style" value={speakingStyle} />
                  <ReviewRow label="Description" value={description} />
                </ReviewSection>
                <ReviewSection
                  icon={<AudioLines className="size-4" />}
                  title="Voice & language"
                  onEdit={() => setStep(2)}
                >
                  <ReviewRow
                    label="Voice"
                    value={`${selectedVoice.name} · ${
                      voiceProviders.find((provider) => provider.id === form.voiceProvider)?.name
                    }`}
                  />
                  <ReviewRow label="Language" value={form.language} />
                </ReviewSection>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep((current) => Math.max(current - 1, 0));
                }}
                disabled={step === 0 || isSubmitting}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:invisible"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={createCompanion}
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Sparkles className="size-4" />
                  {isSubmitting ? "Creating..." : "Create Companion"}
                </button>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Companion Preview</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  A little preview of your new tutor.
                </p>
              </div>
              <span className="rounded-full bg-white p-2 text-violet-600 shadow-sm">
                <Sparkles className="size-4" />
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <span className="flex size-32 items-center justify-center rounded-[2rem] bg-violet-100 text-6xl shadow-inner">
                {form.companionIcon}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-slate-950">
                {form.name.trim() || "Your companion"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {form.speakingStyles.length
                  ? form.speakingStyles.join(" · ")
                  : "Choose a teaching style"}
                {form.language ? ` · ${form.language}` : ""}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-100 bg-white/90 p-4">
              <div className="mb-2 flex items-center gap-2 text-violet-600">
                <AudioLines className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Tutor introduction
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-700">
                Hi, I&apos;m {form.name.trim() || "your new tutor"}! I&apos;m here to help you
                learn one step at a time.
              </p>
              <p className="mt-2 border-t border-violet-100 pt-2 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Globe2 className="size-4 text-violet-600" />
                First lesson
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {form.lessonName || "Your first lesson"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {form.subject ? subjectLabels[form.subject] : "Choose a subject"}
                {" · "}
                {form.targetDurationMinutes} minutes
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              {form.isPublic ? (
                <UsersRound className="size-4 text-violet-600" />
              ) : (
                <LockKeyhole className="size-4 text-slate-500" />
              )}
              {form.isPublic ? "Discoverable by other learners" : "Only visible to you"}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

function ReviewSection({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: ReactNode;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            {icon}
          </span>
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-semibold text-violet-600 hover:text-violet-800"
        >
          Edit
        </button>
      </div>
      <dl className="space-y-2 pl-10">
        {children}
      </dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[110px_minmax(0,1fr)]">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export default CompanionForm;
