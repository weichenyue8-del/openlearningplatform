import { BookOpenCheck, CalendarDays, GraduationCap, Target, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ProtectedDataError } from "@/components/learning/protected-state";
import { requireViewer } from "@/lib/auth/session";
import { getProfileSnapshot } from "@/lib/database/dashboard";

import { updateProfileAction } from "./actions";

export const metadata: Metadata = { title: "Profile", description: "Your private OpenAP student profile and learning summary." };
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Your display name was updated.",
  "invalid-name": "Enter a display name between 1 and 80 characters.",
  configuration: "Supabase setup is required before profile changes can be saved.",
  error: "Your profile could not be updated. Please try again.",
};

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const viewer = await requireViewer("/profile");
  const result = await getProfileSnapshot(viewer.id, viewer.displayName ?? "Student");
  if (!result.ok) return <ProtectedDataError title="Profile is unavailable" message={result.error} />;
  const { status } = await searchParams;
  const initial = result.data.displayName.slice(0, 1).toUpperCase() || "S";

  return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content"><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900"><div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" /><div className="px-6 pb-8 sm:px-10"><div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end"><div aria-label="Default profile avatar" className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg dark:border-slate-900 dark:bg-blue-950 dark:text-blue-300">{initial}</div><div className="pb-1"><p className="text-sm font-bold uppercase tracking-[0.13em] text-blue-600 dark:text-blue-400">Student profile</p><h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{result.data.displayName}</h1><p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays aria-hidden="true" className="size-4" />Joined {new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(result.data.joinedAt))}</p></div></div></div></section>
    {status && messages[status] ? <p className={`mt-6 rounded-2xl border p-4 text-sm ${status === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"}`} role="status">{messages[status]}</p> : null}
    <section className="mt-6 grid gap-4 sm:grid-cols-3">{[{ label: "Enrolled courses", value: result.data.overview.enrolledCourses, icon: GraduationCap }, { label: "Completed lessons", value: result.data.overview.completedLessons, icon: BookOpenCheck }, { label: "Questions answered", value: result.data.overview.questionsAnswered, icon: Target }].map(({ label, value, icon: Icon }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" key={label}><Icon aria-hidden="true" className="size-5 text-blue-600" /><p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">{value}</p><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p></div>)}</section>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><UserRound aria-hidden="true" className="size-5 text-blue-600" /><h2 className="text-xl font-bold text-slate-950 dark:text-white">Display name</h2></div><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">This name appears in your private OpenAP account experience. Your email is not shown publicly.</p><form action={updateProfileAction} className="mt-5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name<input className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" defaultValue={result.data.displayName} maxLength={80} name="displayName" required /></label><button className="button-primary mt-4" type="submit">Save profile</button></form></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-bold text-slate-950 dark:text-white">Course enrollments</h2>{result.data.courses.length ? <ul className="mt-4 space-y-3">{result.data.courses.map((course) => <li className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" key={course.courseId}><Link className="font-bold text-slate-900 hover:text-blue-600 dark:text-white" href={`/courses/${course.courseId}`}>{course.title}</Link><p className="mt-1 text-sm text-slate-500">{course.totalLessons ? `${course.completedLessons} of ${course.totalLessons} published lessons complete` : "Lessons in review"}</p></li>)}</ul> : <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No enrollments yet. <Link className="font-bold text-blue-600" href="/courses">Browse courses</Link>.</p>}</section></div>
  </div></main>;
}
