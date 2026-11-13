import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

import {
  createRecoveryMarker,
  RECOVERY_MARKER_COOKIE,
  recoveryMarkerCookieOptions,
} from "./recovery-marker";
import { sanitizeRedirectPath } from "./redirects";

const ALLOWED_OTP_TYPES = new Set([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

function isAllowedOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_OTP_TYPES.has(value);
}

function localRedirect(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

function finishResponse(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function handleAuthCallback(request: NextRequest) {
  const routeClient = createSupabaseRouteClient(request);
  if (!routeClient.supabase) {
    return finishResponse(
      routeClient.apply(localRedirect(request, "/login?error=configuration")),
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const requestedFlow = request.nextUrl.searchParams.get("flow");
  let nextPath = sanitizeRedirectPath(request.nextUrl.searchParams.get("next"));
  let succeeded = false;
  let recoveryFlow = false;
  let recoverySetupFailed = false;

  try {
    if (code) {
      const { error } = await routeClient.supabase.auth.exchangeCodeForSession(code);
      succeeded = !error;
      recoveryFlow = requestedFlow === "recovery" && nextPath === "/update-password";
    } else if (tokenHash && isAllowedOtpType(otpType)) {
      const { error } = await routeClient.supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
      succeeded = !error;
      if (otpType === "recovery") {
        nextPath = "/update-password";
        recoveryFlow = true;
      }
    }
  } catch {
    succeeded = false;
  }

  let recoveryMarker: string | null = null;
  if (succeeded && recoveryFlow) {
    try {
      const { data, error } = await routeClient.supabase.auth.getClaims();
      const userId = data?.claims?.sub;
      recoveryMarker =
        !error && typeof userId === "string" ? createRecoveryMarker(userId) : null;
      recoverySetupFailed = recoveryMarker === null;
      succeeded = recoveryMarker !== null;
    } catch {
      succeeded = false;
    }
  }

  const response = succeeded
    ? localRedirect(request, nextPath)
    : localRedirect(
        request,
        recoverySetupFailed
          ? "/login?error=recovery-configuration"
          : "/login?error=verification",
      );

  const appliedResponse = routeClient.apply(response);
  if (recoveryMarker) {
    appliedResponse.cookies.set(
      RECOVERY_MARKER_COOKIE,
      recoveryMarker,
      recoveryMarkerCookieOptions(),
    );
  }

  return finishResponse(appliedResponse);
}
