import { BookOpenText } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      className="group inline-flex items-center gap-2.5 rounded-lg text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white"
      href="/"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20 transition-transform group-hover:-rotate-3">
        <BookOpenText aria-hidden="true" className="size-5" strokeWidth={2.2} />
      </span>
      <span className="text-lg font-bold tracking-[-0.035em]">OpenAP</span>
    </Link>
  );
}
