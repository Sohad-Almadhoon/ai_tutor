"use client";

import {
  createBookmarkAction,
  deleteBookmarkAction,
} from "@/actions/bookmark.action";
import { deleteLessonAction } from "@/actions/lesson.action";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Clock3,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { subjectsColors } from "@/constants";
import { useToast } from "@/components/ToastProvider";

type LessonCardProps = {
  lesson: {
    id: number;
    name: string;
    topic: string;
    subject: string;
    targetDurationMinutes: number;
    isPublic: boolean;
    bookmarkId: number | null;
    isOwned?: boolean;
    defaultCompanion: { name: string; companionIcon: string } | null;
  };
};

const LessonCard = ({ lesson }: LessonCardProps) => {
  const router = useRouter();
  const showToast = useToast();
  const [bookmarkId, setBookmarkId] = useState(lesson.bookmarkId);
  const isBookmarked = bookmarkId !== null;
  const [isSavingBookmark, setIsSavingBookmark] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState<"bookmark" | "lesson" | null>(
    null
  );
  const [bookmarkError, setBookmarkError] = useState("");
  const subjectColor =
    Object.entries(subjectsColors).find(
      ([subject]) => subject === lesson.subject.toLowerCase()
    )?.[1] ?? "#EDE9FE";

  const handleBookmarkClick = async () => {
    if (bookmarkId !== null) {
      setConfirmation("bookmark");
      return;
    }

    setIsSavingBookmark(true);
    setBookmarkError("");

    try {
      const result = await createBookmarkAction(lesson.id);
      if (!result.success) throw new Error(result.error);
      setBookmarkId(result.data.id);
      showToast("success", "Lesson saved successfully.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update this lesson.";
      setBookmarkError(message);
      showToast("error", message);
    } finally {
      setIsSavingBookmark(false);
    }
  };

  const handleDeleteLesson = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteLessonAction(lesson.id);
      if (!result.success) throw new Error(result.error);
      showToast("success", "Lesson deleted successfully.");
      router.refresh();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete this lesson.";
      showToast("error", message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveBookmark = async () => {
    if (bookmarkId === null) return true;

    setIsSavingBookmark(true);
    try {
      const result = await deleteBookmarkAction(bookmarkId);
      if (!result.success) throw new Error(result.error);
      setBookmarkId(null);
      showToast("success", "Lesson removed from your saved list.");
      router.refresh();
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update this lesson.";
      setBookmarkError(message);
      showToast("error", message);
      return false;
    } finally {
      setIsSavingBookmark(false);
    }
  };

  return (
    <article className="group relative flex h-full min-h-72 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: subjectColor }}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pr-24">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize text-slate-800"
            style={{ backgroundColor: subjectColor }}
          >
            <BookOpen className="size-3.5" aria-hidden="true" />
            {lesson.subject}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              lesson.isPublic
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {lesson.isPublic ? "Public" : "Private"}
          </span>
        </div>

        <div className="mt-5">
          <h2 className="line-clamp-2 min-h-14 pr-16 text-xl font-bold leading-7 tracking-tight text-slate-900 transition-colors group-hover:text-violet-800">
            {lesson.name}
          </h2>
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
            {lesson.topic}
          </p>
        </div>

        <div className="mt-auto pt-5">
          {lesson.defaultCompanion ? (
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-violet-50/80 px-3.5 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {lesson.defaultCompanion.companionIcon}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
                  Suggested tutor
                </p>
                <p className="truncate text-sm font-semibold text-slate-800">
                  {lesson.defaultCompanion.name}
                </p>
              </div>
              <Sparkles
                className="ml-auto size-4 shrink-0 text-violet-400"
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
              <BookOpen className="size-4" aria-hidden="true" />
              Choose a tutor when you start
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Clock3 className="size-4 text-violet-500" aria-hidden="true" />
            {lesson.targetDurationMinutes} minutes
          </span>
          <Link
            href={`/lessons/${lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-violet-700 transition-colors hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            Start lesson
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="absolute right-4 top-4 flex gap-2">
        {lesson.isOwned && (
          <button
            type="button"
            onClick={() => setConfirmation("lesson")}
            disabled={isDeleting || isSavingBookmark}
            aria-label="Delete lesson"
            title="Delete lesson"
            className="flex size-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2
              className={`size-4 ${isDeleting ? "animate-pulse" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
        <button
          type="button"
          onClick={handleBookmarkClick}
          disabled={isSavingBookmark || isDeleting}
          aria-label={isBookmarked ? "Remove saved lesson" : "Save lesson"}
          aria-pressed={isBookmarked}
          title={isBookmarked ? "Remove from saved lessons" : "Save this lesson"}
          className={`flex size-9 items-center justify-center rounded-xl border bg-white shadow-sm transition hover:scale-105 hover:border-violet-200 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-wait disabled:opacity-60 ${
            isBookmarked
              ? "border-violet-200 text-violet-700"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <Bookmark
            className={`size-4 ${isSavingBookmark ? "animate-pulse" : ""}`}
            fill={isBookmarked ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
        {bookmarkError && (
          <p
            role="alert"
            className="absolute right-0 top-full z-10 mt-2 w-52 rounded-xl border border-red-100 bg-white p-3 text-xs leading-5 text-red-700 shadow-lg"
          >
            {bookmarkError}
          </p>
        )}
      </div>
      <ConfirmationDialog
        open={confirmation !== null}
        title={
          confirmation === "lesson" ? "Delete this lesson?" : "Remove saved lesson?"
        }
        description={
          confirmation === "lesson"
            ? "This permanently deletes the lesson, along with its saved bookmarks and learning session history."
            : "This removes the lesson from your saved list. The lesson itself will not be deleted."
        }
        confirmLabel={confirmation === "lesson" ? "Delete lesson" : "Remove"}
        onClose={() => setConfirmation(null)}
        onConfirm={
          confirmation === "lesson" ? handleDeleteLesson : handleRemoveBookmark
        }
      />
    </article>
  );
};

export default LessonCard;