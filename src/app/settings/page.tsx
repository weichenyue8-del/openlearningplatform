import { KeyRound, Mail, MoonStar, ShieldCheck, UserRound } from "lucide-react";
import type { Metadata } from "next";

import { ProtectedDataError } from "@/components/learning/protected-state";
import { courseCategories } from "@/content/course-catalog";
import { requireViewer } from "@/lib/auth/session";
import { getUserPreferences } from "@/lib/database/profile";

import { requestDeletionAction, updateAccountPasswordAction, updateAppearanceAction, updateEmailAction, updateSettingsDisplayNameAction } from "./actions";

export const metadata: Metadata = { title: "Account Settings", description: "Manage your private OpenAP account and learning preferences." };
export const dynamic = "force-dynamic";

const statusMessages: Record<string, { text: string; good?: boolean }> = {
  "invalid-email": { text: "Enter a valid email address." },
  "email-error": { text: "The email change could not be started." },
  "email-verification": { text: "Check both email addresses for the verification steps required by your Supabase project.", good: true },
  "invalid-name": { text: "Enter a display name between 1 and 80 characters." },
  "name-error": { text: "Your display name could not be saved." },
  "name-saved": { text: "Your display name was updated.", good: true },
  "invalid-password": { text: "Use your current password and a matching new password of at least 12 characters." },
  "password-error": { text: "The current password was not accepted or the new password could not be saved." },
  "password-saved": { text: "Your password was updated.", good: true },
  "appearance-saved": { text: "Your appearance and subject preferences were saved.", good: true },
  "appearance-error": { text: "Your preferences could not be saved." },
  "deletion-confirmation": { text: "Type DELETE exactly to create an account deletion request." },
  "deletion-requested": { text: "Your deletion request is pending. Your Auth account has not been deleted yet.", good: true },
  "deletion-error": { text: "The deletion request could not be recorded." },
  "signout-error": { text: "OpenAP could not end the server session, so you remain signed in. Please try again." },
  configuration: { text: "Supabase setup is required for account changes." },
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const viewer = await requireViewer("/settings");
  const result = await getUserPreferences(viewer.id);
  if (!result.ok) return <ProtectedDataError title="Settings are unavailable" message={result.error} />;
  const { status } = await searchParams;
  const notice = status ? statusMessages[status] : undefined;
  return <main className="min-h-screen bg-slate-50 dark:bg-slate-950" id="main-content"><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">Private account controls</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl dark:text-white">Account Settings</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Manage verified account details, appearance, and privacy requests.</p>
    {notice ? <p className={`mt-7 rounded-2xl border p-4 text-sm ${notice.good ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"}`} role="status">{notice.text}</p> : null}
    <div className="mt-8 grid gap-6 lg:grid-cols-2"><SettingsCard icon={UserRound} title="Display name" text="This private account name is used in your dashboard and profile. It is not a public profile."><form action={updateSettingsDisplayNameAction} className="mt-5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name<input autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" defaultValue={result.data.displayName} maxLength={80} name="displayName" required /></label><button className="button-primary mt-4" type="submit">Update display name</button></form></SettingsCard>
      <SettingsCard icon={Mail} title="Email address" text="Changing email starts Supabase's verification flow; it does not silently replace your sign-in address."><form action={updateEmailAction} className="mt-5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">New email<input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" defaultValue={viewer.email ?? ""} name="email" required type="email" /></label><button className="button-primary mt-4" type="submit">Request email change</button></form></SettingsCard>
      <SettingsCard icon={KeyRound} title="Password" text="Your current password is required before a new password is accepted."><form action={updateAccountPasswordAction} className="mt-5 space-y-3"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Current password<input autoComplete="current-password" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" name="currentPassword" required type="password" /></label><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">New password<input autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" minLength={12} name="password" required type="password" /></label><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm new password<input autoComplete="new-password" className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" minLength={12} name="confirmPassword" required type="password" /></label><button className="button-primary" type="submit">Update password</button></form></SettingsCard>
      <SettingsCard icon={MoonStar} title="Appearance & interests" text="Theme applies on this device; subject interests are stored with your account."><form action={updateAppearanceAction} className="mt-5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Theme<select className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" defaultValue={result.data.theme} name="theme"><option value="system">Use system setting</option><option value="light">Light</option><option value="dark">Dark</option></select></label><fieldset className="mt-5"><legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preferred subjects</legend><div className="mt-3 grid grid-cols-2 gap-2">{courseCategories.map((subject) => <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700" key={subject}><input defaultChecked={result.data.preferredSubjects.includes(subject)} name="subjects" type="checkbox" value={subject} />{subject}</label>)}</div></fieldset><button className="button-primary mt-5" type="submit">Save preferences</button></form></SettingsCard>
      <SettingsCard danger icon={ShieldCheck} title="Privacy & account deletion" text="OpenAP stores your account profile, enrollments, lesson progress, practice submissions and results, saved resources, and preferences so they can sync across devices. Guest browser data stays local unless you explicitly confirm an import."><p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">A deletion request is recorded for a verified operator to complete securely. OpenAP will not claim your Auth account or learning data has been deleted until that backend process finishes.</p>{result.data.deletionRequestedAt ? <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Pending since {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(result.data.deletionRequestedAt))}.</p> : <form action={requestDeletionAction} className="mt-5"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Type DELETE to confirm<input className="mt-2 h-12 w-full rounded-xl border border-rose-300 bg-white px-4 dark:border-rose-900 dark:bg-slate-950" name="confirmation" required /></label><button className="mt-4 inline-flex items-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700" type="submit">Create deletion request</button></form>}</SettingsCard></div>
  </div></main>;
}

function SettingsCard({ icon: Icon, title, text, children, danger = false }: { icon: typeof Mail; title: string; text: string; children: React.ReactNode; danger?: boolean }) { return <section className={`rounded-3xl border bg-white p-6 dark:bg-slate-900 ${danger ? "border-rose-200 dark:border-rose-900" : "border-slate-200 dark:border-slate-800"}`}><div className="flex items-center gap-2"><Icon aria-hidden="true" className={`size-5 ${danger ? "text-rose-600" : "text-blue-600"}`} /><h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2></div><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>{children}</section>; }
