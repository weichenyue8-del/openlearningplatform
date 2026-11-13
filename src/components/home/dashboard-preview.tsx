import { ArrowUpRight, BookOpen, Check, Code2, Sigma } from "lucide-react";

const lessons = [
  { icon: Sigma, label: "Limits and continuity", status: "Read" },
  { icon: Code2, label: "Java variables", status: "Practice" },
] as const;

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-blue-100/60 blur-2xl dark:bg-blue-950/30" />
      <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Learning workspace
          </span>
        </div>
        <div className="grid sm:grid-cols-[0.7fr_1.3fr]">
          <div className="border-b border-slate-200 bg-slate-50 p-5 sm:border-b-0 dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Today</p>
            <div className="mt-3 space-y-1">
              {["Learn", "Practice", "Review"].map((label, index) => (
                <div
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    index === 0
                      ? "bg-blue-600 font-medium text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                  key={label}
                >
                  <span className="font-mono text-[10px] opacity-70">0{index + 1}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Continue learning</p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950 dark:text-white">Build your foundation</h2>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <BookOpen aria-hidden="true" className="size-4" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {lessons.map(({ icon: Icon, label, status }) => (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" key={label}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500">{status}</p>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-slate-400" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="grid size-5 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Check aria-hidden="true" className="size-3" />
              </span>
              Free and open curriculum
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
