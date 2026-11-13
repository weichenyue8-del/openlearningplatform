import type { AuthError } from "@supabase/supabase-js";

type AuthOperation = "login" | "signup" | "recovery" | "update-password";

export function getSafeAuthErrorMessage(error: AuthError, operation: AuthOperation): string {
  if (error.status === 429 || error.code === "over_request_rate_limit") {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (operation === "login") {
    if (error.code === "email_not_confirmed") {
      return "Confirm your email address before signing in.";
    }
    return "The email or password is incorrect.";
  }

  if (operation === "signup") {
    if (error.code === "weak_password") {
      return "Choose a stronger password and try again.";
    }
    return "We could not create the account. Try signing in or resetting your password.";
  }

  if (operation === "update-password") {
    if (error.code === "same_password") {
      return "Choose a password you have not used for this account.";
    }
    return "We could not update your password. Request a new recovery link and try again.";
  }

  return "We could not send the recovery email. Please try again shortly.";
}
