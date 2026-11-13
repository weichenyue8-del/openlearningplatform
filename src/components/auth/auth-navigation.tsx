import { BookOpenCheck, CircleAlert, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { getOptionalViewer } from "@/lib/auth/session";

const menuLinkClass =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white";

function GuestNavigation({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <Link className="button-secondary justify-center" href="/login">
          Sign In
        </Link>
        <Link className="button-primary justify-center" href="/signup">
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className="button-secondary !px-4 !py-2" href="/login">
        Sign In
      </Link>
      <Link className="button-primary !px-4 !py-2" href="/signup">
        Get Started
      </Link>
    </div>
  );
}

export async function AuthNavigation({ mobile = false }: { mobile?: boolean }) {
  const viewer = await getOptionalViewer();
  if (!viewer) return <GuestNavigation mobile={mobile} />;

  const label = viewer.displayName ?? viewer.email ?? "Student";

  if (mobile) {
    return (
      <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <p className="truncate px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <Link className={menuLinkClass} href="/dashboard">
          <LayoutDashboard aria-hidden="true" className="size-4" /> Dashboard
        </Link>
        <Link className={menuLinkClass} href="/profile">
          <UserRound aria-hidden="true" className="size-4" /> Profile
        </Link>
        <Link className={menuLinkClass} href="/my-learning">
          <BookOpenCheck aria-hidden="true" className="size-4" /> My Learning
        </Link>
        <Link className={menuLinkClass} href="/my-mistakes">
          <CircleAlert aria-hidden="true" className="size-4" /> My Mistakes
        </Link>
        <Link className={menuLinkClass} href="/settings">
          <Settings aria-hidden="true" className="size-4" /> Account Settings
        </Link>
        <form action={signOutAction}>
          <button className={`${menuLinkClass} w-full`} type="submit">
            <LogOut aria-hidden="true" className="size-4" /> Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className="button-primary !px-4 !py-2" href="/dashboard">
        Dashboard
      </Link>
      <details className="group relative">
        <summary className="flex max-w-44 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {label.slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate">{label}</span>
        </summary>
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
          <Link className={menuLinkClass} href="/profile">
            <UserRound aria-hidden="true" className="size-4" /> Profile
          </Link>
          <Link className={menuLinkClass} href="/my-learning">
            <BookOpenCheck aria-hidden="true" className="size-4" /> My Learning
          </Link>
          <Link className={menuLinkClass} href="/my-mistakes">
            <CircleAlert aria-hidden="true" className="size-4" /> My Mistakes
          </Link>
          <Link className={menuLinkClass} href="/settings">
            <Settings aria-hidden="true" className="size-4" /> Account Settings
          </Link>
          <form action={signOutAction} className="mt-1 border-t border-slate-200 pt-1 dark:border-slate-700">
            <button className={`${menuLinkClass} w-full`} type="submit">
              <LogOut aria-hidden="true" className="size-4" /> Sign Out
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

export function AuthNavigationFallback({ mobile = false }: { mobile?: boolean }) {
  return mobile ? (
    <div className="mt-2 h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
  ) : (
    <div className="flex items-center gap-2" aria-hidden="true">
      <span className="h-10 w-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      <span className="h-10 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}
