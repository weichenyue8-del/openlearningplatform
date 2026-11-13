import { Settings } from "lucide-react";

export function ConfigurationNotice() {
  return (
    <div
      className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Settings aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Authentication setup required</p>
          <p className="mt-1 leading-6">
            Add the Supabase project URL and publishable key to the local environment before using
            account features. Public courses and practice remain available without an account.
          </p>
        </div>
      </div>
    </div>
  );
}
