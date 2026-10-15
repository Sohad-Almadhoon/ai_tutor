import { BookmarkIcon, Layers3Icon } from "lucide-react";
import Image from "next/image";
import { subjectsColors } from "@/constants";

type CompanionCardProps = {
  companion: {
    id: number;
    name: string;
    description: string;
    companionIcon: string;
    language: string;
    lessons: { id: number; subject: string }[];
  };
};

const CompanionCard = ({ companion }: CompanionCardProps) => {
  const subjects = [
    ...new Set(companion.lessons.map((lesson) => lesson.subject)),
  ].map((subject) => ({
    name: subject,
    color: Object.entries(subjectsColors).find(
      ([key]) => key === subject.toLowerCase()
    )?.[1],
  }));

  return (
    <article className="flex min-h-64 flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {Array.from(companion.companionIcon).length <= 2 ? (
          <span
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-4xl"
          >
            {companion.companionIcon}
          </span>
        ) : (
          <Image
            src="/images/ai-robot.jpg"
            alt=""
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-lg font-bold text-slate-900">{companion.name}</h2>
            <BookmarkIcon className="size-5 shrink-0 text-slate-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{companion.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map(({ name, color }) => (
          <span
            key={name}
            className="rounded-full px-3 py-1 text-xs font-medium capitalize text-slate-800"
            style={{ backgroundColor: color ?? "#E2E8F0" }}
          >
            {name}
          </span>
        ))}
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
          {companion.language}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <Layers3Icon className="size-4" aria-hidden="true" />
          {companion.lessons.length} {companion.lessons.length === 1 ? "lesson" : "lessons"}
        </span>
        <span className="font-medium text-orange-600">Explore lessons →</span>
      </div>
    </article>
  );
};

export default CompanionCard;
