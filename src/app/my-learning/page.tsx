import { ArrowRight, Bookmark, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GuestImportBanner } from "@/components/learning/guest-import-banner";
import { ProtectedDataError } from "@/components/learning/protected-state";
import { requireViewer } from "@/lib/auth/session";
import { getMyLearningSnapshot } from "@/lib/database/dashboard";

export const metadata: Metadata = { title: "My Learning", description: "Your synced OpenAP courses and saved resources." };
export const dynamic = "force-dynamic";

export default async function MyLearningPage() {
  const viewer = await requireViewer("/my-learning");
  const result = await getMyLearningSnapshot(viewer.id);
  if (!result.ok) return <ProtectedDataError title="My Learning is unavailable" message={result.error} />;

  return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Your library</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl dark:text-white">My Learning</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Continue enrolled courses and open resources saved to your account.</p><div className="mt-8"><GuestImportBanner compact /></div>
    <section className="mt-8" aria-labelledby="my-courses"><div className="flex items-center gap-2"><GraduationCap aria-hidden="true" className="size-5 text-blue-600" /><h2 className="text-2xl font-bold text-slate-950 dark:text-white" id="my-courses">Courses</h2></div>{result.data.courses.length ? <div className="mt-5 grid gap-5 md:grid-cols-2">{result.data.courses.map((course) => <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" key={course.courseId}><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{course.category}</p><h3 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{course.title}</h3><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{course.totalLessons ? `${course.completedLessons} of ${course.totalLessons} published lessons completed` : "Lessons are still in review"}</p><LastAccessed value={course.lastAccessedAt} />{course.completionPercentage !== null ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-600" style={{ width: `${course.completionPercentage}%` }} /></div> : null}<Link className="button-primary mt-5" href={course.continueHref}>{course.continueLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link></article>)}</div> : <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><GraduationCap aria-hidden="true" className="mx-auto size-8 text-slate-400" /><h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">No courses saved yet</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add a course from the public catalog or open a lesson to create a resume point.</p><Link className="button-primary mt-6" href="/courses">Browse courses</Link></div>}</section>
    <section className="mt-12" aria-labelledby="saved-resources" id="saved-resources"><div className="flex items-center gap-2"><Bookmark aria-hidden="true" className="size-5 text-blue-600" /><h2 className="text-2xl font-bold text-slate-950 dark:text-white">Saved resources</h2></div>{result.data.savedResources.length ? <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{result.data.savedResources.map((resource) => <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900" key={resource.id}><p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">{resource.provider}</p><h3 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{resource.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{resource.description}</p><a className="button-secondary mt-5" href={resource.url} rel="noopener noreferrer" target="_blank">Open resource<ArrowRight aria-hidden="true" className="size-4" /></a></article>)}</div> : <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><Bookmark aria-hidden="true" className="mx-auto size-8 text-slate-400" /><h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">No account bookmarks yet</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Save a verified resource, or confirm an import from this browser.</p><Link className="button-primary mt-6" href="/resources">Explore resources</Link></div>}</section>
  </div></main>;
}

function LastAccessed({ value }: { value: string | null }) {
  if (!value) {
    return <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Not opened yet</p>;
  }

  return (
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Last accessed{" "}
      <time dateTime={value}>
        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))}
      </time>
    </p>
  );
}
