import {
  ArrowRight,
  Atom,
  BookText,
  Brain,
  Calculator,
  ChartBar,
  Code2,
  Landmark,
} from "lucide-react";
import Link from "next/link";

import {
  getCourseLessonCount,
  isCourseAvailable,
  type Course,
  type CourseIconName,
} from "@/content/course-catalog";

const iconMap = {
  calculus: Calculator,
  statistics: ChartBar,
  code: Code2,
  economics: Landmark,
  physics: Atom,
  psychology: Brain,
  english: BookText,
} satisfies Record<CourseIconName, typeof Calculator>;

const colorMap: Record<CourseIconName, string> = {
  calculus: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  statistics: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  code: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  economics: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  physics: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  psychology: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  english: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function CourseCard({ course }: { course: Course }) {
  const Icon = iconMap[course.icon];
  const lessonCount = getCourseLessonCount(course);
  const available = isCourseAvailable(course);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-11 place-items-center rounded-xl ${colorMap[course.icon]}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            available
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {available ? "Available" : "Coming Soon"}
        </span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.13em] text-blue-600 dark:text-blue-400">
        {course.category}
      </p>
      <h3 className="mt-2 text-xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">
        {course.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {course.description}
      </p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {available ? `${lessonCount} reviewed lessons` : "Content in review"}
        </span>
        <Link
          aria-label={`Explore ${course.title}`}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-600 outline-none transition-colors hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          href={`/courses/${course.slug}`}
        >
          Explore
          <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
