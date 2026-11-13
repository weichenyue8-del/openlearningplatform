import {
  ArrowLeft,
  Construction,
  GitFork,
  HeartHandshake,
  Info,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/site";

const pages = {
  about: {
    title: "Education should be open to everyone",
    eyebrow: "About OpenAP",
    description: "OpenAP is a free, open-source learning platform built by students, for students.",
    detail: "The project begins with AP subjects and a small set of reviewed lessons. Its architecture is designed to grow into more courses without trading accuracy for volume.",
    icon: Info,
    action: { href: "/courses", label: "Explore the curriculum" },
  },
  privacy: {
    title: "Privacy by restraint",
    eyebrow: "Privacy",
    description: "Public lessons remain available without an account. If you choose to register, OpenAP stores only the account and learning data needed for synchronization.",
    detail: "Email authentication and private learning records are handled through the configured Supabase project with per-user database policies. Browser-only progress is not uploaded until a signed-in student explicitly confirms an import. A reviewed legal privacy policy is still required before production launch; this summary is not presented as legal advice.",
    icon: ShieldCheck,
    action: { href: "/", label: "Return home" },
  },
  terms: {
    title: "Project terms are being prepared",
    eyebrow: "Terms",
    description: "Formal terms will be reviewed alongside the open-source and educational-content licensing documents.",
    detail: "Until those documents are published, this page clearly indicates its setup state instead of presenting fabricated legal language.",
    icon: Construction,
    action: { href: "/", label: "Return home" },
  },
  contact: {
    title: "Contact OpenAP",
    eyebrow: "Contact",
    description: "Use the official project contact destination when it is available.",
    detail: "OpenAP never publishes an invented email address or contact form. The configured project destination will be used here.",
    icon: Mail,
    action: { href: "/contribute", label: "View contribution setup" },
  },
  contribute: {
    title: "Help make learning clearer",
    eyebrow: "Contribute",
    description: "OpenAP welcomes accurate lessons, corrected examples, accessibility improvements, and thoughtful reviews.",
    detail: "Every contribution should be original, verifiable, and written for learners. Repository availability is shown clearly below.",
    icon: HeartHandshake,
    action: { href: "/courses", label: "Review published courses" },
  },
} as const;

type InfoSlug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((infoSlug) => ({ infoSlug }));
}

export async function generateMetadata({ params }: PageProps<"/[infoSlug]">): Promise<Metadata> {
  const { infoSlug } = await params;
  const page = pages[infoSlug as InfoSlug];
  if (!page) return {};
  return { title: page.eyebrow, description: page.description };
}

export default async function InfoPage({ params }: PageProps<"/[infoSlug]">) {
  const { infoSlug } = await params;
  const page = pages[infoSlug as InfoSlug];
  if (!page) notFound();

  const Icon = page.icon;
  const isContribute = infoSlug === "contribute";
  const isContact = infoSlug === "contact";
  const configuredUrl = isContribute ? siteConfig.githubUrl : isContact ? siteConfig.contactUrl : null;

  return (
    <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-5 py-16 dark:bg-slate-950 sm:px-8" id="main-content">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">{page.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl dark:text-white">{page.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{page.description}</p>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{page.detail}</p>

        {isContribute ? (
          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950" id="repository-setup">
            <h2 className="font-bold text-slate-950 dark:text-white">Repository status</h2>
            {configuredUrl ? (
              <a className="button-primary mt-4" href={configuredUrl} rel="noreferrer" target="_blank"><GitFork aria-hidden="true" className="size-4" />Contribute on GitHub</a>
            ) : (
              <div className="mt-3">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">Set <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">NEXT_PUBLIC_GITHUB_REPOSITORY_URL</code> to the official repository before enabling the external link.</p>
                <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Setup required</span>
              </div>
            )}
          </div>
        ) : null}

        {isContact && siteConfig.contactUrl ? <a className="button-primary mt-7" href={siteConfig.contactUrl}>Open official contact page</a> : null}
        {isContact && !siteConfig.contactUrl ? <p className="mt-7 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">Contact URL setup required</p> : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center">
          <Link className="button-primary justify-center" href={page.action.href}>{page.action.label}</Link>
          <Link className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href="/"><ArrowLeft aria-hidden="true" className="size-4" />OpenAP home</Link>
        </div>
      </section>
    </main>
  );
}
