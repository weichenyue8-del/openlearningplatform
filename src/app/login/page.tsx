import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { LoginForm } from "@/components/auth/login-form";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to synchronize your OpenAP learning progress.",
};
export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    next?: string | string[];
  }>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  const nextPath = sanitizeRedirectPath(first(query.next));
  const error = first(query.error);
  const message = first(query.message);

  return (
    <AuthPageShell
      description="Continue where you left off and keep progress, practice history, and saved resources in sync."
      eyebrow="Welcome back"
      footer={
        <p>
          New to OpenAP?{" "}
          <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href={`/signup?next=${encodeURIComponent(nextPath)}`}>
            Create a free account
          </Link>
        </p>
      }
      title="Sign in to OpenAP"
    >
      {!configured || error === "configuration" ? <ConfigurationNotice /> : null}

      {configured && error === "verification" ? (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200" role="alert">
          That email link is invalid or expired. Request a new link and try again.
        </p>
      ) : null}

      {configured && error === "recovery-configuration" ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100" role="alert">
          Password recovery protection is not configured. Ask the site operator to finish the server setup before requesting another reset link.
        </p>
      ) : null}

      {configured && error === "session" ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100" role="status">
          We could not verify your session. Sign in again to continue safely.
        </p>
      ) : null}

      {message === "password-updated" ? (
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200" role="status">
          Your password was updated. Sign in with the new password.
        </p>
      ) : null}

      <LoginForm configured={configured} nextPath={nextPath} />

      <div className="mt-5 text-right">
        <Link className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href="/forgot-password">
          Forgot your password?
        </Link>
      </div>
    </AuthPageShell>
  );
}
