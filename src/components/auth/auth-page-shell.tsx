import { BookOpenCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main
      className="min-h-[calc(100vh-4rem)] bg-slate-50 px-5 py-12 dark:bg-slate-950 sm:px-8 lg:py-16"
      id="main-content"
    >
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="absolute -bottom-28 -left-24 size-72 rounded-full bg-indigo-950/40 blur-3xl" />
          <div className="relative">
            <Link className="inline-flex items-center gap-2 font-bold tracking-tight" href="/">
              <BookOpenCheck aria-hidden="true" className="size-6" />
              OpenAP
            </Link>
            <p className="mt-14 text-3xl font-bold leading-tight tracking-[-0.04em]">
              Your learning belongs to you.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">
              Keep public lessons open to everyone, and use an account only when you want progress
              to follow you across devices.
            </p>
          </div>
          <div className="relative mt-16 flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-blue-50">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p>Passwords are handled by Supabase Auth and are never stored in OpenAP tables.</p>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-7 border-t border-slate-200 pt-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              {footer}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
