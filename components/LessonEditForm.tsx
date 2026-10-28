"use client";

import { updateLessonAction } from "@/actions/lesson.action";
import { lessonDurations, subjects } from "@/constants";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type LessonEditFormProps = {
  lesson: {
    id: number;
    name: string;
    topic: string;
    subject: string;
    targetDurationMinutes: number;
    isPublic: boolean;
  };
};

const fieldClassName =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

const LessonEditForm = ({ lesson }: LessonEditFormProps) => {
  const router = useRouter();
  const showToast = useToast();
  const [name, setName] = useState(lesson.name);
  const [topic, setTopic] = useState(lesson.topic);
  const [subject, setSubject] = useState(lesson.subject.toLowerCase());
  const [duration, setDuration] = useState(lesson.targetDurationMinutes);
  const [isPublic, setIsPublic] = useState(lesson.isPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await updateLessonAction(lesson.id, {
        name,
        topic,
        subject,
        targetDurationMinutes: duration,
        isPublic,
      });
      if (!result.success) throw new Error(result.error);

      showToast("success", "Lesson updated successfully.");
      router.push("/lessons");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update this lesson.";
      setError(message);
      showToast("error", message);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <label htmlFor="edit-lesson-name" className="text-sm font-semibold text-slate-800">
          Lesson title
        </label>
        <input
          id="edit-lesson-name"
          required
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="edit-lesson-subject" className="text-sm font-semibold text-slate-800">
          Subject
        </label>
        <select
          id="edit-lesson-subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className={fieldClassName}
        >
          {subjects.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="edit-lesson-topic" className="text-sm font-semibold text-slate-800">
          Learning focus
        </label>
        <textarea
          id="edit-lesson-topic"
          required
          maxLength={500}
          rows={5}
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition hover:border-slate-300 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <div>
        <label htmlFor="edit-lesson-duration" className="text-sm font-semibold text-slate-800">
          Session length
        </label>
        <select
          id="edit-lesson-duration"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
          className={fieldClassName}
        >
          {lessonDurations.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
          {!lessonDurations.some((minutes) => minutes === duration) && (
            <option value={duration}>{duration} minutes</option>
          )}
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-violet-200">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="mt-0.5 size-4 accent-violet-600"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-800">
            Share this lesson publicly
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            Public lessons can be discovered and saved by other learners.
          </span>
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default LessonEditForm;
