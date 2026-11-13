import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a secure OpenAP password reset link.",
};
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

  return (
    <AuthPageShell
      description="Enter your account email. For privacy, the confirmation message is the same whether or not an account exists."
      eyebrow="Account recovery"
      footer={
        <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href="/login">
          Back to sign in
        </Link>
      }
      title="Reset your password"
    >
      {!configured ? <ConfigurationNotice /> : null}
      <ForgotPasswordForm configured={configured} />
    </AuthPageShell>
  );
}
