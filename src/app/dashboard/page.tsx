import { ArrowRight, BookOpenCheck, Brain, GraduationCap, LibraryBig, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { GuestImportBanner } from "@/components/learning/guest-import-banner";
import { ProtectedDataError } from "@/components/learning/protected-state";
import { requireViewer } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/database/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Student Dashboard", description: "Your real OpenAP learning progress and practice history." };

export default async function DashboardPage() {
  const viewer = await requireViewer("/dashboard");
  const result = await getDashboardSnapshot(viewer.id, viewer.displayName ?? "Student");
  if (!result.ok) return <ProtectedDataError title="Dashboard unavailable" message={result.error} />;
  const data = result.data;
  const stats = [
    { label: "Enrolled courses", value: data.overview.enrolledCourses, icon: GraduationCap },
    { label: "Completed lessons", value: data.overview.completedLessons, icon: BookOpenCheck },
    { label: "Questions answered", value: data.overview.questionsAnswered, icon: Target },
    { label: "Overall accuracy", value: data.overview.overallAccuracy === null ? "—" : `${data.overview.overallAccuracy}%`, icon: Brain },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">Student dashboard</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-6xl dark:text-white">Welcome Back!</h1><p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Track your progress, strengthen your skills, and keep learning.</p><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Signed in as {data.displayName}</p></div></section>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <GuestImportBanner />
        <section aria-label="Learning overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={label}><Icon aria-hidden="true" className="size-5 text-blue-600 dark:text-blue-400" /><p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>{label === "Overall accuracy" && data.overview.overallAccuracy === null ? <p className="mt-2 text-xs text-slate-400">No practice attempts yet</p> : null}</div>)}</section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Resume learning</p><h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Your courses</h2></div><Link className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400" href="/my-learning">View all</Link></div>{data.courses.length ? <div className="mt-6 space-y-4">{data.courses.slice(0, 4).map((course) => <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700" key={course.courseId}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-slate-950 dark:text-white">{course.title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.totalLessons ? `${course.completedLessons} of ${course.totalLessons} published lessons` : "Lessons in review"}</p></div><span className="font-bold text-blue-600 dark:text-blue-400">{course.completionPercentage === null ? "—" : `${course.completionPercentage}%`}</span></div><LastAccessed value={course.lastAccessedAt} />{course.completionPercentage !== null ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-600" style={{ width: `${course.completionPercentage}%` }} /></div> : null}<Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400" href={course.continueHref}>{course.continueLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link></article>)}</div> : <EmptyState icon={LibraryBig} title="No enrolled courses yet" text="Add a course to My Learning, or open a lesson to create a resume point." href="/courses" action="Browse courses" />}</section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Next steps</p><h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Recommended learning</h2>{data.recommendations.length ? <div className="mt-5 space-y-3">{data.recommendations.map((item) => <Link className="block rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/30" href={item.href} key={item.id}><span className="font-bold text-slate-950 dark:text-white">{item.title}</span><span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{item.reason}</span></Link>)}</div> : <EmptyState icon={Target} title="No recommendation yet" text="Enroll in a course or complete practice to create a data-backed next step." href="/practice" action="Start practice" />}</section>
        </div>

        <section className="mt-8"><DashboardCharts accuracy={data.accuracy} courseProgress={data.courseProgress} subjectPerformance={data.subjectPerformance} topicMastery={data.topicMastery} /></section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Account history</p><h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Recent activity</h2></div><Link className="button-secondary" href="/my-mistakes">Review mistakes</Link></div>{data.recentActivity.length ? <ol className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">{data.recentActivity.map((item) => <li className="py-4" key={item.id}><Link className="flex items-center justify-between gap-4" href={item.href}><span><span className="block font-semibold text-slate-900 dark:text-white">{item.title}</span><span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{item.detail}</span></span><time className="shrink-0 text-xs text-slate-500" dateTime={item.occurredAt}>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.occurredAt))}</time></Link></li>)}</ol> : <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Completed lessons, signed-in practice sessions, and saved resources will appear here.</p>}</section>
      </div>
    </main>
  );
}

function EmptyState({ icon: Icon, title, text, href, action }: { icon: typeof LibraryBig; title: string; text: string; href: string; action: string }) {
  return <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-slate-700"><Icon aria-hidden="true" className="mx-auto size-7 text-slate-400" /><h3 className="mt-3 font-bold text-slate-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p><Link className="button-primary mt-5" href={href}>{action}<ArrowRight aria-hidden="true" className="size-4" /></Link></div>;
}

function LastAccessed({ value }: { value: string | null }) {
  if (!value) {
    return <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Not opened yet</p>;
  }

  return (
    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
      Last accessed{" "}
      <time dateTime={value}>
        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value))}
      </time>
    </p>
  );
}
