import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseEnrollmentControl } from "@/components/learning/course-enrollment-control";
import {
  courses,
  getCourseBySlug,
  getCourseLessonCount,
  isCourseAvailable,
} from "@/content/course-catalog";
import { getOptionalPublicViewer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return courses.map((course) => ({ courseSlug: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[courseSlug]">): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    openGraph: { title: course.title, description: course.description, images: [] },
    twitter: { title: course.title, description: course.description, images: [] },
  };
}

export default async function CoursePage({ params }: PageProps<"/courses/[courseSlug]">) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();
  const viewer = await getOptionalPublicViewer();

  const available = isCourseAvailable(course);
  const lessonCount = getCourseLessonCount(course);
  const firstLesson = course.units[0]?.lessons[0];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/courses">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All courses
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{course.category}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${available ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>{available ? "Available now" : "Coming soon"}</span>
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">{course.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{course.description}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Lessons</p>
                  <p className="mt-1 font-bold text-slate-950 dark:text-white">{available ? lessonCount : "In review"}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Access</p>
                  <p className="mt-1 font-bold text-slate-950 dark:text-white">Free</p>
                </div>
              </div>
              {firstLesson ? (
                <Link className="button-primary mt-5 w-full justify-center" href={`/courses/${course.slug}/${firstLesson.slug}`}>
                  Start first lesson
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ) : (
                <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">Lessons will appear only after content review.</p>
              )}
              <CourseEnrollmentControl authenticated={Boolean(viewer)} courseId={course.slug} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-14">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><BookOpen aria-hidden="true" className="size-5" /><h2 className="text-sm font-bold uppercase tracking-[0.14em]">Course overview</h2></div>
          <p className="mt-5 text-sm leading-7 text-slate-700 dark:text-slate-300">{course.overview}</p>
          <h3 className="mt-8 text-lg font-bold text-slate-950 dark:text-white">What you’ll learn</h3>
          <ul className="mt-4 space-y-3">
            {course.objectives.map((objective) => <li className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300" key={objective}><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Check aria-hidden="true" className="size-3" /></span>{objective}</li>)}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 text-slate-950 dark:text-white"><Layers3 aria-hidden="true" className="size-5" /><h2 className="text-xl font-bold">Units and lessons</h2></div>
          {course.units.length > 0 ? (
            <div className="mt-5 space-y-5">
              {course.units.map((unit) => (
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" key={unit.slug}>
                  <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h3 className="font-bold text-slate-950 dark:text-white">{unit.title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{unit.description}</p></div>
                  <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                    {unit.lessons.map((lesson, index) => (
                      <li key={lesson.slug}>
                        <Link className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-950/30" href={`/courses/${course.slug}/${lesson.slug}`}>
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-400">{index + 1}</span>
                          <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{lesson.title}</span><span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{lesson.description}</span></span>
                          <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><Clock3 aria-hidden="true" className="size-3.5" />{lesson.duration}</span>
                          <ArrowRight aria-hidden="true" className="size-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="font-bold text-slate-950 dark:text-white">Reviewed lessons are coming soon</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">This course is listed so contributors can see the planned catalog, but no lesson is published until real content exists.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
