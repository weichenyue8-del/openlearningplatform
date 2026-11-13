import { ArrowRight, Code2, GitFork, LibraryBig, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";

import { CourseCard } from "@/components/courses/course-card";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { courses } from "@/content/course-catalog";
import { siteConfig } from "@/lib/site";

const features = [
  {
    icon: LibraryBig,
    title: "Structured Learning",
    description: "Move from clear objectives to explanations, worked examples, and connected lessons.",
  },
  {
    icon: Target,
    title: "Interactive Practice",
    description: "Build skills with original questions, server-checked answers, useful explanations, and local progress insights.",
  },
  {
    icon: Users,
    title: "Open-Source Community",
    description: "Students and educators can improve explanations, examples, and accessibility together.",
  },
] as const;

export default function Home() {
  return (
    <main id="main-content">
      <section className="relative overflow-hidden bg-white dark:bg-slate-950">
        <div className="hero-grid absolute inset-0 -z-20 opacity-60 dark:opacity-20" />
        <div className="absolute left-1/2 top-16 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl dark:bg-blue-950/50 sm:h-96 sm:w-96" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Open learning, built together
            </div>
            <h1 className="mt-7 text-balance text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              Learn Smarter.
              <span className="block text-blue-600 dark:text-blue-400">Together.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              A free, open-source learning platform built by students, for students.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary justify-center sm:justify-start" href="/courses">
                Explore Courses
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link className="button-secondary justify-center sm:justify-start" href="/practice">
                <Code2 aria-hidden="true" className="size-4" />
                Start Practicing
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              <span>Free forever</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">•</span>
              <span>No ads</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">•</span>
              <span>Community maintained</span>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Featured courses</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">Start with a subject that moves you forward.</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" href="/courses">
              Browse the full library
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => <CourseCard course={course} key={course.slug} />)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-slate-950 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Why OpenAP?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">Learning tools with a clear purpose.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" key={title}>
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><Icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white sm:py-20" id="contribute">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">Open by design</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Built by Students. Improved by Everyone.</h2>
            <p className="mt-5 text-base leading-8 text-slate-300">OpenAP grows through reviewed contributions. A clearer explanation, a corrected example, or a more accessible lesson can make learning better for the next student.</p>
            {!siteConfig.githubUrl ? <p className="mt-4 inline-flex rounded-lg border border-amber-700/60 bg-amber-950/50 px-3 py-2 text-xs font-medium text-amber-200">Repository link is not configured yet—no fictional destination is used.</p> : null}
          </div>
          {siteConfig.githubUrl ? (
            <a className="button-primary justify-center" href={siteConfig.githubUrl} rel="noreferrer" target="_blank"><GitFork aria-hidden="true" className="size-4" />Contribute on GitHub</a>
          ) : (
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-slate-600 hover:bg-slate-800" href="/contribute#repository-setup"><GitFork aria-hidden="true" className="size-4" />Repository setup</Link>
          )}
        </div>
      </section>
    </main>
  );
}
