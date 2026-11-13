import { CircleAlert, LoaderCircle } from "lucide-react";
import Link from "next/link";

export function ProtectedLoading({ label = "Loading your learning data…" }: { label?: string }) {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-slate-50 px-5 dark:bg-slate-950" id="main-content">
      <p className="flex items-center gap-3 font-semibold text-slate-600 dark:text-slate-300"><LoaderCircle aria-hidden="true" className="size-5 animate-spin text-blue-600" />{label}</p>
    </main>
  );
}

export function ProtectedDataError({ title, message }: { title: string; message: string }) {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-slate-50 px-5 py-16 dark:bg-slate-950" id="main-content">
      <section className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 dark:border-amber-900 dark:bg-slate-900">
        <CircleAlert aria-hidden="true" className="mx-auto size-9 text-amber-600" />
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="button-primary" href="/dashboard">Try dashboard again</Link><Link className="button-secondary" href="/courses">Browse public courses</Link></div>
      </section>
    </main>
  );
}
