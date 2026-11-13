import { ArrowRight, BookOpenCheck, LibraryBig, ShieldCheck, Video } from "lucide-react";
import type { Metadata } from "next";

import { ResourceExplorer } from "@/components/resources/resource-explorer";
import { GuestImportBanner } from "@/components/learning/guest-import-banner";
import { courses } from "@/content/course-catalog";
import { getOptionalPublicViewer } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site";
import { learningResources } from "@/resources/catalog";

export const metadata: Metadata = {
  title: "Free Learning Resources",
  description: "Discover verified educational videos, open courses, textbooks, official documentation, and open-source learning repositories.",
};
export const dynamic = "force-dynamic";

const courseNames = Object.fromEntries(courses.map((course) => [course.slug, course.title]));

export default async function ResourcesPage() {
  const viewer = await getOptionalPublicViewer();
  const videoCount = learningResources.filter((resource) => resource.type === "youtube-video").length;
  const openCount = learningResources.filter((resource) => resource.access !== "free-access").length;
  const contributionHref = siteConfig.githubUrl
    ? `${siteConfig.githubUrl.replace(/\.git$/, "")}/blob/main/docs/ADDING_RESOURCES.md`
    : "/contribute#repository-setup";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div aria-hidden="true" className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              <LibraryBig aria-hidden="true" className="size-4" />
              Verified learning library
            </p>
            <h1 className="mt-7 text-5xl font-bold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              Explore Free Learning Resources
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Discover high-quality educational videos, open courses, and learning materials — all in one place.
            </p>
          </div>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified links</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{learningResources.length}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><Video aria-hidden="true" className="size-3.5" />Videos</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{videoCount}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><BookOpenCheck aria-hidden="true" className="size-3.5" />Open resources</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{openCount}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <dt className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"><ShieldCheck aria-hidden="true" className="size-3.5" />Checked</dt>
              <dd className="mt-1 text-sm font-bold text-slate-950 dark:text-white">Nov 12, 2026</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {viewer ? <GuestImportBanner compact /> : null}
        <ResourceExplorer authenticated={Boolean(viewer)} courseNames={courseNames} resources={learningResources} />

        <section className="mt-20 rounded-[2rem] border border-blue-200 bg-blue-50 px-6 py-10 dark:border-blue-900 dark:bg-blue-950/30 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Community-reviewed catalog</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">Know a resource that belongs here?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Propose it through the documented GitHub review workflow. New links stay unpublished until their source, metadata, quality, and licensing are checked.</p>
          </div>
          {siteConfig.githubUrl ? (
            <a className="button-primary mt-6 shrink-0 justify-center sm:mt-0" href={contributionHref} rel="noopener noreferrer" target="_blank">
              Contribution guide
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          ) : (
            <a className="button-primary mt-6 shrink-0 justify-center sm:mt-0" href={contributionHref}>
              Set up contributions
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
