import { Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-slate-50 px-5 py-16 text-center dark:bg-slate-950" id="main-content">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><Compass aria-hidden="true" className="size-6" /></span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">This page is not in the curriculum.</h1>
        <p className="mx-auto mt-4 max-w-lg text-slate-600 dark:text-slate-400">The link may be outdated, or the lesson has not been published.</p>
        <Link className="button-primary mt-7" href="/courses">Browse courses</Link>
      </div>
    </main>
  );
}
