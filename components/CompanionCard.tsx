"use client";

import { deleteCompanionAction } from "@/actions/companion.action";
import { useToast } from "@/components/ToastProvider";
import {
  ArrowRight,
  BookOpen,
  Layers3Icon,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { subjectsColors } from "@/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanionCardProps = {
  isOwned: boolean;
  companion: {
    id: number;
    name: string;
    description: string;
    companionIcon: string;
    language: string;
    lessons: { id: number; subject: string }[];
  };
};

const CompanionCard = ({ companion, isOwned }: CompanionCardProps) => {
  const router = useRouter();
  const showToast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const subjects = [
    ...new Set(companion.lessons.map((lesson) => lesson.subject)),
  ].map((subject) => ({
    name: subject,
    color: Object.entries(subjectsColors).find(
      ([key]) => key === subject.toLowerCase()
    )?.[1],
  }));

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this companion? Its lessons will remain, but will no longer have this default tutor."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCompanionAction(companion.id);
      if (!result.success) throw new Error(result.error);
      showToast("success", "Companion deleted successfully.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete this companion.";
      showToast("error", message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="group relative flex min-h-72 flex-col gap-5 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 sm:p-6">
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-14 size-36 rounded-full bg-violet-100/70 blur-2xl transition group-hover:bg-violet-200/70"
      />
      <div className="relative flex items-start gap-4">
        {Array.from(companion.companionIcon).length <= 2 ? (
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-100 text-4xl shadow-sm"
          >
            {companion.companionIcon}
          </span>
        ) : (
          <Image
            src="/images/ai-robot.jpg"
            alt=""
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-2xl object-cover shadow-sm"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
              <Link
                href={`/companions/${companion.id}`}
                className="rounded-sm transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
              >
                {companion.name}
              </Link>
            </h2>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {companion.description || "A friendly AI tutor ready to explore new topics with you."}
          </p>
        </div>
      </div>

      {isOwned && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete companion"
          title="Delete companion"
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-wait disabled:opacity-60"
        >
          <Trash2
            className={`size-4 ${isDeleting ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}

      <div className="relative flex flex-wrap gap-2">
        {subjects.length > 0 ? subjects.map(({ name, color }) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize text-slate-800"
            style={{ backgroundColor: color ?? "#E2E8F0" }}
          >
            <BookOpen className="size-3" aria-hidden="true" />
            {name}
          </span>
        )) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Sparkles className="size-3" aria-hidden="true" />
            Ready to teach
          </span>
        )}
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
          {companion.language}
        </span>
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <Layers3Icon className="size-4 text-violet-500" aria-hidden="true" />
          {companion.lessons.length} {companion.lessons.length === 1 ? "lesson" : "lessons"}
        </span>
        <Link
          href={`/companions/${companion.id}/lessons`}
          className="rounded-sm font-semibold text-violet-700 transition-colors hover:text-violet-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
        >
          <span className="inline-flex items-center gap-1">
            Explore lessons
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </article>
  );
};

export default CompanionCard;
