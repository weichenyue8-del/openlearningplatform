import { BookOpen, Circle, CircleDot } from "lucide-react";
import Link from "next/link";

import type { Course } from "@/content/course-catalog";

export function CourseNavigation({ course, activeLessonSlug }: { course: Course; activeLessonSlug: string }) {
  return (
    <nav aria-label={`${course.title} lessons`}>
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400" href={`/courses/${course.slug}`}>
        <BookOpen aria-hidden="true" className="size-4" />
        {course.shortTitle}
      </Link>
      <div className="mt-6 space-y-6">
        {course.units.map((unit) => (
          <section key={unit.slug}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{unit.title}</h2>
            <ol className="mt-3 space-y-1">
              {unit.lessons.map((lesson) => {
                const active = lesson.slug === activeLessonSlug;
                return (
                  <li key={lesson.slug}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm leading-5 transition-colors ${
                        active
                          ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`}
                      href={`/courses/${course.slug}/${lesson.slug}`}
                    >
                      {active ? <CircleDot aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <Circle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                      {lesson.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </nav>
  );
}
