import type { Metadata } from "next";

import { CourseLibrary } from "@/components/courses/course-library";

export const metadata: Metadata = {
  title: "Course Library",
  description: "Browse OpenAP courses and start a reviewed AP Calculus BC or AP Computer Science A lesson.",
};

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Course library</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl dark:text-white">Find your next subject.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Browse the AP catalog. Courses with reviewed lessons are ready to learn; the rest show an honest coming-soon state.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <CourseLibrary />
      </section>
    </main>
  );
}
