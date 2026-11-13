import Link from "next/link";

import { siteConfig } from "@/lib/site";

import { Logo } from "./logo";

const footerGroups: Array<{
  heading: string;
  links: Array<{ href: string; label: string; external?: boolean }>;
}> = [
  {
    heading: "Learn",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/practice", label: "Practice" },
      { href: "/resources", label: "Resources" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/contribute", label: "Contributing" },
      {
        href: siteConfig.githubUrl || "/contribute#repository-setup",
        label: "GitHub",
        external: Boolean(siteConfig.githubUrl),
      },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_2fr] lg:px-10">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
            Free, open learning resources built by students, for students.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.heading}>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                {group.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href={link.href} rel="noreferrer" target="_blank">{link.label}</a>
                    ) : (
                      <Link className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-slate-500 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} OpenAP. Educational content is reviewed separately from the software.
        </p>
      </div>
    </footer>
  );
}
