"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { getSafeAuthErrorMessage } from "@/lib/auth/errors";
import {
  isRecoveryMarkerConfigured,
  RECOVERY_MARKER_COOKIE,
  verifyRecoveryMarker,
} from "@/lib/auth/recovery-marker";
import { sanitizeRedirectPath } from "@/lib/auth/redirects";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/auth/schemas";
import type { AuthActionState, AuthFieldName } from "@/lib/auth/types";
import { getSiteUrl } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validationError(error: ZodError): AuthActionState {
  return {
    status: "error",
    message: "Check the highlighted fields and try again.",
    fieldErrors: error.flatten().fieldErrors as Partial<Record<AuthFieldName, string[]>>,
  };
}

function configurationError(detail = "Authentication is not configured yet."): AuthActionState {
  return { status: "error", message: detail };
}

function unavailableError(): AuthActionState {
  return {
    status: "error",
    message: "Authentication is temporarily unavailable. Please try again shortly.",
  };
}

function callbackUrl(
  siteUrl: string,
  nextPath: string,
  flow?: "recovery",
): string {
  const url = new URL("/auth/callback", siteUrl);
  url.searchParams.set("next", sanitizeRedirectPath(nextPath));
  if (flow) url.searchParams.set("flow", flow);
  return url.toString();
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) return configurationError();

  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return { status: "error", message: getSafeAuthErrorMessage(error, "login") };
    }
    const preferences = await supabase
      .from("user_preferences")
      .select("theme")
      .maybeSingle();
    const theme = preferences.data?.theme;
    if (theme === "light" || theme === "dark" || theme === "system") {
      const store = await cookies();
      store.set("openap-theme", theme, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 31_536_000,
      });
    }
  } catch {
    return unavailableError();
  }

  redirect(sanitizeRedirectPath(formString(formData, "next")));
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    displayName: formString(formData, "displayName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) return configurationError();

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return configurationError("Set NEXT_PUBLIC_SITE_URL before enabling email verification.");
  }

  const nextPath = sanitizeRedirectPath(formString(formData, "next"));
  let hasSession = false;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: callbackUrl(siteUrl, nextPath),
      },
    });

    if (error) {
      return { status: "error", message: getSafeAuthErrorMessage(error, "signup") };
    }

    hasSession = Boolean(data.session);
  } catch {
    return unavailableError();
  }

  if (hasSession) redirect(nextPath);

  return {
    status: "success",
    message: "Check your email to confirm your account, then return here to sign in.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formString(formData, "email"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) return configurationError();

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    return configurationError("Set NEXT_PUBLIC_SITE_URL before enabling password recovery.");
  }
  if (!isRecoveryMarkerConfigured()) {
    return configurationError("Password recovery protection is not configured yet.");
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: callbackUrl(siteUrl, "/update-password", "recovery"),
    });

    if (error?.status === 429) {
      return { status: "error", message: getSafeAuthErrorMessage(error, "recovery") };
    }
  } catch {
    return unavailableError();
  }

  return {
    status: "success",
    message: "If an account exists for that email, a secure reset link is on its way.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formString(formData, "password"),
    confirmPassword: formString(formData, "confirmPassword"),
  });
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) return configurationError();

  try {
    const claims = await supabase.auth.getClaims();
    const userId = claims.data?.claims?.sub;
    const store = await cookies();
    const recoveryMarker = store.get(RECOVERY_MARKER_COOKIE)?.value;
    if (
      claims.error ||
      typeof userId !== "string" ||
      !verifyRecoveryMarker(recoveryMarker, userId)
    ) {
      return {
        status: "error",
        message: "This recovery link is invalid or expired. Request a new one.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      return { status: "error", message: getSafeAuthErrorMessage(error, "update-password") };
    }

    store.delete(RECOVERY_MARKER_COOKIE);
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    return unavailableError();
  }

  redirect("/login?message=password-updated");
}

export async function signOutAction(): Promise<never> {
  const supabase = await createClient({ cookieWrites: "required" });
  let failed = !supabase;

  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      failed = Boolean(error);
    } catch {
      failed = true;
    }
  }

  if (failed) redirect("/settings?status=signout-error");
  redirect("/login");
}
