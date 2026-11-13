export default function CoursesLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
      id="main-content"
    >
      <span className="sr-only">Loading the course library…</span>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl animate-pulse px-5 py-14 sm:px-8 lg:px-10">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-12 max-w-xl rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-6 max-w-2xl rounded bg-slate-100 dark:bg-slate-900" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              key={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
