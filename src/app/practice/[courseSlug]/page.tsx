import { ArrowLeft, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PracticeSession } from "@/components/practice/practice-session";
import { courses, getCourseBySlug } from "@/content/course-catalog";
import { getPublicPracticeQuestions } from "@/practice/question-bank.server";
import { sanitizeReturnPath } from "@/practice/storage";
import type { Difficulty } from "@/practice/types";

export function generateStaticParams() {
  return courses.map((course) => ({ courseSlug: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/practice/[courseSlug]">): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return {};
  return {
    title: `Practice ${course.shortTitle}`,
    description: `Work through original ${course.title} practice questions with instant feedback.`,
  };
}

export default async function PracticeCoursePage({
  params,
  searchParams,
}: PageProps<"/practice/[courseSlug]">) {
  const { courseSlug } = await params;
  const query = await searchParams;
  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const difficulty = ["easy", "medium", "hard"].includes(String(query.difficulty))
    ? (query.difficulty as Difficulty)
    : undefined;
  const unitId = typeof query.unit === "string" ? query.unit : undefined;
  const topicId = typeof query.topic === "string" ? query.topic : undefined;
  const ids = typeof query.ids === "string"
    ? query.ids.split(",").filter(Boolean).slice(0, 20)
    : undefined;
  const initialSessionId = typeof query.session === "string" ? query.session.slice(0, 80) : undefined;
  const returnTo = sanitizeReturnPath(typeof query.returnTo === "string" ? query.returnTo : undefined);

  const questions = getPublicPracticeQuestions({
    courseId: course.slug,
    unitId,
    topicId,
    difficulty,
    ids,
  });

  if (questions.length === 0) {
    return (
      <main className="grid min-h-[75vh] place-items-center bg-slate-50 px-5 py-16 dark:bg-slate-950" id="main-content">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><Clock3 aria-hidden="true" className="size-6" /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">{getPublicPracticeQuestions({ courseId: course.slug }).length === 0 ? "Coming Soon" : "No matching questions"}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{course.title} practice</h1>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{getPublicPracticeQuestions({ courseId: course.slug }).length === 0 ? "Reviewed practice questions for this course are still being prepared." : "The selected filters do not match any current question. Adjust them on the practice dashboard."}</p>
          <Link className="button-primary mt-7" href="/practice"><ArrowLeft aria-hidden="true" className="size-4" />Return to practice</Link>
        </section>
      </main>
    );
  }

  return (
    <PracticeSession
      courseTitle={course.title}
      filters={{ unitId, topicId, difficulty }}
      initialQuestions={questions}
      initialSessionId={initialSessionId}
      returnTo={returnTo}
    />
  );
}
