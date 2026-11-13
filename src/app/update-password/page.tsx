import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getOptionalViewer } from "@/lib/auth/session";
import {
  isRecoveryMarkerConfigured,
  RECOVERY_MARKER_COOKIE,
  verifyRecoveryMarker,
} from "@/lib/auth/recovery-marker";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Choose a New Password",
  description: "Securely update your OpenAP account password.",
};
export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const configured = isSupabaseConfigured();
  const viewer = configured ? await getOptionalViewer() : null;
  const marker = (await cookies()).get(RECOVERY_MARKER_COOKIE)?.value;
  const recoveryReady =
    configured &&
    isRecoveryMarkerConfigured() &&
    Boolean(viewer && verifyRecoveryMarker(marker, viewer.id));

  return (
    <AuthPageShell
      description="Choose a new password for your account. After it is updated, you will sign in again."
      eyebrow="Secure recovery"
      footer={
        <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" href="/login">
          Back to sign in
        </Link>
      }
      title="Choose a new password"
    >
      {!configured ? <ConfigurationNotice /> : null}

      {configured && !recoveryReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100" role="alert">
          <p className="font-semibold">This recovery session is unavailable or expired.</p>
          <p className="mt-1">
            Request a new password reset email, then open its link in this browser.
          </p>
          <Link className="button-secondary mt-4" href="/forgot-password">
            Request a New Link
          </Link>
        </div>
      ) : null}

      {recoveryReady ? <UpdatePasswordForm configured /> : null}
    </AuthPageShell>
  );
}
