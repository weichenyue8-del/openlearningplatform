import { CheckCircle2, Filter, RotateCcw, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ProtectedDataError } from "@/components/learning/protected-state";
import { requireViewer } from "@/lib/auth/session";
import { getMistakeReview } from "@/lib/database/mistakes";
import { getPracticeCourseSummaries, getPracticeQuestionMetadata } from "@/practice/question-bank.server";

export const metadata: Metadata = { title: "My Mistakes", description: "Review incorrect OpenAP practice attempts without erasing history." };
export const dynamic = "force-dynamic";

export default async function MyMistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string | string[]; topic?: string | string[] }>;
}) {
  const viewer = await requireViewer("/my-mistakes");
  const query = await searchParams;
  const courseIds = new Set(getPracticeCourseSummaries().map((course) => course.id));
  const requestedCourse = typeof query.course === "string" ? query.course : undefined;
  const courseId = requestedCourse && courseIds.has(requestedCourse) ? requestedCourse : undefined;
  const topicIds = new Set(getPracticeQuestionMetadata(courseId ? { courseId } : {}).map((item) => item.topicId));
  const requestedTopic = typeof query.topic === "string" ? query.topic : undefined;
  const topicId = requestedTopic && topicIds.has(requestedTopic) ? requestedTopic : undefined;
  const result = await getMistakeReview(viewer.id, { courseId, topicId });
  if (!result.ok) return <ProtectedDataError title="Mistake history is unavailable" message={result.error} />;
  const courses = getPracticeCourseSummaries().filter((course) => course.questionCount > 0);
  const topics = [...new Map(getPracticeQuestionMetadata(courseId ? { courseId } : {}).map((item) => [item.topicId, item.topicLabel])).entries()];

  return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content"><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Practice history</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl dark:text-white">My Mistakes</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">Review every incorrect signed-in attempt. Later correct answers mark a mistake as reviewed; the original record remains in your history.</p>
    <form className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_1fr_auto]" method="get"><label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Course<select className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm normal-case dark:border-slate-700 dark:bg-slate-950" defaultValue={courseId ?? ""} name="course"><option value="">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.shortTitle}</option>)}</select></label><label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Topic<select className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm normal-case dark:border-slate-700 dark:bg-slate-950" defaultValue={topicId ?? ""} name="topic"><option value="">All topics</option>{topics.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><button className="button-secondary self-end justify-center" type="submit"><Filter aria-hidden="true" className="size-4" />Apply filters</button></form>
    {result.data.length ? <div className="mt-8 space-y-4">{result.data.map((item) => <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" key={item.id}><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.12em] text-rose-600 dark:text-rose-400">{item.courseTitle} · {item.topicLabel}</p><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${item.reviewed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>{item.reviewed ? <CheckCircle2 aria-hidden="true" className="size-3.5" /> : <XCircle aria-hidden="true" className="size-3.5" />}{item.reviewed ? "Reviewed by a later correct attempt" : "Needs review"}</span></div><h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{item.prompt}</h2><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-950/30"><dt className="text-xs font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">Your answer</dt><dd className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.submittedAnswer}</dd></div><div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30"><dt className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Correct answer</dt><dd className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.correctAnswer}</dd></div></dl><details className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Show explanation</summary><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.explanation}</p></details><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><time className="text-xs text-slate-500" dateTime={item.attemptedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.attemptedAt))}</time><Link className="button-primary" href={item.retryHref}><RotateCcw aria-hidden="true" className="size-4" />Retry this question</Link></div></article>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900"><CheckCircle2 aria-hidden="true" className="mx-auto size-9 text-emerald-600" /><h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">No matching mistakes</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Incorrect signed-in attempts will appear here after they are securely graded and saved.</p><Link className="button-primary mt-6" href="/practice">Start practice</Link></div>}
  </div></main>;
}
