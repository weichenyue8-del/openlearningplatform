import { GitFork, Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { AuthNavigation, AuthNavigationFallback } from "@/components/auth/auth-navigation";
import { siteConfig } from "@/lib/site";

import { Logo } from "./logo";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/practice", label: "Practice" },
  { href: "/resources", label: "Resources" },
  { href: "/contribute", label: "Contribute" },
] as const;

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

function GitHubLink({ mobile = false }: { mobile?: boolean }) {
  const className = mobile
    ? `${navLinkClass} flex items-center gap-2`
    : `${navLinkClass} inline-flex items-center gap-1.5`;

  if (siteConfig.githubUrl) {
    return (
      <a className={className} href={siteConfig.githubUrl} rel="noreferrer" target="_blank">
        <GitFork aria-hidden="true" className="size-4" />
        GitHub
      </a>
    );
  }

  return (
    <Link className={className} href="/contribute#repository-setup">
      <GitFork aria-hidden="true" className="size-4" />
      GitHub
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo />

        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 lg:flex">
          {navigation.map((item) => (
            <Link className={navLinkClass} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <GitHubLink />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Suspense fallback={<AuthNavigationFallback />}>
            <AuthNavigation />
          </Suspense>
        </div>

        <details className="group relative lg:hidden">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            <span className="sr-only">Open navigation</span>
            <Menu aria-hidden="true" className="size-5" />
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-12 flex w-64 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900"
          >
            {navigation.map((item) => (
              <Link className={navLinkClass} href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <GitHubLink mobile />
            <Suspense fallback={<AuthNavigationFallback mobile />}>
              <AuthNavigation mobile />
            </Suspense>
          </nav>
        </details>
      </div>
      </header>
    </>
  );
}
