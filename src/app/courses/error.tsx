"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CoursesError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-5 py-16 dark:bg-slate-950" id="main-content">
      <section className="w-full max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-amber-900 dark:bg-slate-900">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
          The course library could not load
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Your learning content is still safe. Try loading the library again, or return home and continue with public practice.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="button-primary justify-center" onClick={retry} type="button">
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
          <Link className="button-secondary justify-center" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
