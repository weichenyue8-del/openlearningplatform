import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { SignupForm } from "@/components/auth/signup-form";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Create a free OpenAP account for synchronized learning progress.",
};
export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const query = await searchParams;
  const configured = isSupabaseConfigured();
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const nextPath = sanitizeRedirectPath(rawNext);

  return (
    <AuthPageShell
      description="Create an account when you want progress and saved learning resources to follow you across devices."
      eyebrow="Free student account"
      footer={
        <p>
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href={`/login?next=${encodeURIComponent(nextPath)}`}>
            Sign in
          </Link>
        </p>
      }
      title="Start your learning journey"
    >
      {!configured ? <ConfigurationNotice /> : null}
      <SignupForm configured={configured} nextPath={nextPath} />
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Creating an account does not restrict public access. You can keep using lessons and
        practice without signing in.
      </p>
    </AuthPageShell>
  );
}
