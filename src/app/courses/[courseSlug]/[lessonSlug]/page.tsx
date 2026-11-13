import { ArrowLeft, ArrowRight, Clock3, ListTree, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseNavigation } from "@/components/lesson/course-navigation";
import { LessonContent } from "@/components/lesson/lesson-content";
import { LessonProgressControl } from "@/components/learning/lesson-progress-control";
import { LessonResources } from "@/components/resources/lesson-resources";
import {
  courses,
  getAdjacentLessons,
  getCourseBySlug,
  getLesson,
} from "@/content/course-catalog";
import { getLessonPracticeLink } from "@/practice/question-bank.server";
import { getResourcesForLesson } from "@/resources/catalog";
import { getOptionalPublicViewer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return courses.flatMap((course) =>
    course.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        courseSlug: course.slug,
        lessonSlug: lesson.slug,
      })),
    ),
  );
}

export async function generateMetadata({ params }: PageProps<"/courses/[courseSlug]/[lessonSlug]">): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  const lesson = course ? getLesson(course, lessonSlug) : undefined;
  if (!course || !lesson) return {};

  const title = `${lesson.title} · ${course.shortTitle}`;
  return {
    title,
    description: lesson.description,
    openGraph: { title, description: lesson.description, images: [] },
    twitter: { title, description: lesson.description, images: [] },
  };
}

export default async function LessonPage({ params }: PageProps<"/courses/[courseSlug]/[lessonSlug]">) {
  const { courseSlug, lessonSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const lesson = getLesson(course, lessonSlug);
  if (!lesson) notFound();
  const viewer = await getOptionalPublicViewer();

  const adjacent = getAdjacentLessons(course, lessonSlug);
  const practice = getLessonPracticeLink(course.slug, lesson.slug);
  const lessonResources = getResourcesForLesson(course.slug, lesson.slug);
  const lessonPath = `/courses/${course.slug}/${lesson.slug}`;
  const practiceQuery = new URLSearchParams({ returnTo: lessonPath });
  if (practice?.topicId) practiceQuery.set("topic", practice.topicId);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950" id="main-content">
      <div className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 lg:hidden">
        <details className="mx-auto max-w-3xl px-5 py-3 sm:px-8">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200">
            <ListTree aria-hidden="true" className="size-4" />
            Course navigation
          </summary>
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <CourseNavigation activeLessonSlug={lesson.slug} course={course} />
          </div>
        </details>
      </div>

      <div className="mx-auto grid max-w-[94rem] lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_15rem]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-200 bg-slate-50 px-5 py-8 dark:border-slate-800 dark:bg-slate-900/50 lg:block">
          <CourseNavigation activeLessonSlug={lesson.slug} course={course} />
        </aside>

        <div className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-14">
          <div className="mx-auto max-w-3xl">
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href={`/courses/${course.slug}`}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {course.title}
            </Link>
            <div className="mt-8 border-b border-slate-200 pb-8 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Lesson</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5" />{lesson.duration}</span>
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl dark:text-white">{lesson.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{lesson.description}</p>
            </div>

            <LessonContent lesson={lesson} />

            <LessonResources
              authenticated={Boolean(viewer)}
              courseNames={{ [course.slug]: course.title }}
              resources={lessonResources}
            />

            {practice ? (
              <aside className="my-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Check your understanding</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Ready to use what you learned?</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Work through {practice.count} original {practice.count === 1 ? "question" : "questions"} for this topic, then return to the lesson.</p>
                </div>
                <Link className="button-primary mt-5 shrink-0 justify-center sm:mt-0" href={`/practice/${course.slug}?${practiceQuery}`}>
                  <Target aria-hidden="true" className="size-4" />
                  Practice This Topic
                </Link>
              </aside>
            ) : null}

            <LessonProgressControl
              authenticated={Boolean(viewer)}
              courseId={course.slug}
              lessonId={lesson.slug}
            />

            <nav aria-label="Lesson pagination" className="grid gap-3 border-t border-slate-200 py-8 dark:border-slate-800 sm:grid-cols-2">
              {adjacent.previous ? (
                <Link className="group rounded-2xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/30" href={`/courses/${course.slug}/${adjacent.previous.slug}`}>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><ArrowLeft aria-hidden="true" className="size-3.5" />Previous lesson</span>
                  <span className="mt-2 block font-bold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{adjacent.previous.title}</span>
                </Link>
              ) : <div />}
              {adjacent.next ? (
                <Link className="group rounded-2xl border border-slate-200 p-4 text-right transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/30" href={`/courses/${course.slug}/${adjacent.next.slug}`}>
                  <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Next lesson<ArrowRight aria-hidden="true" className="size-3.5" /></span>
                  <span className="mt-2 block font-bold text-slate-950 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{adjacent.next.title}</span>
                </Link>
              ) : (
                <Link className="group rounded-2xl border border-blue-200 bg-blue-50 p-4 text-right transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:hover:bg-blue-950" href="/courses">
                  <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">End of published course<ArrowRight aria-hidden="true" className="size-3.5" /></span>
                  <span className="mt-2 block font-bold text-slate-950 dark:text-white">Return to course library</span>
                </Link>
              )}
            </nav>
          </div>
        </div>

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto border-l border-slate-200 px-5 py-8 dark:border-slate-800 xl:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">On this page</p>
          <nav aria-label="Table of contents" className="mt-4 space-y-1">
            {lesson.sections.map((section) => (
              <a className="block rounded-lg px-3 py-2 text-sm leading-5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-300" href={`#${section.id}`} key={section.id}>{section.title}</a>
            ))}
          </nav>
          <Link className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" href="/courses">
            Browse all courses
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </aside>
      </div>
    </main>
  );
}
