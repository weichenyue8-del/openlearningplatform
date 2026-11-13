import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const RECOVERY_MARKER_COOKIE = "openap-password-recovery";
export const RECOVERY_MARKER_MAX_AGE_SECONDS = 15 * 60;

type RecoveryMarkerPayload = {
  exp: number;
  sub: string;
};

function getRecoverySecret(): string | null {
  const secret = process.env.OPENAP_AUTH_RECOVERY_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isRecoveryMarkerConfigured(): boolean {
  return getRecoverySecret() !== null;
}

export function createRecoveryMarker(
  userId: string,
  now = Date.now(),
): string | null {
  const secret = getRecoverySecret();
  if (!secret) return null;

  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(now / 1_000) + RECOVERY_MARKER_MAX_AGE_SECONDS,
      sub: userId,
    } satisfies RecoveryMarkerPayload),
  ).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

export function verifyRecoveryMarker(
  marker: string | undefined,
  userId: string,
  now = Date.now(),
): boolean {
  const secret = getRecoverySecret();
  if (!secret || !marker) return false;

  const separator = marker.lastIndexOf(".");
  if (separator <= 0 || separator === marker.length - 1) return false;

  const payload = marker.slice(0, separator);
  const suppliedSignature = marker.slice(separator + 1);
  const expectedSignature = sign(payload, secret);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<RecoveryMarkerPayload>;
    return (
      parsed.sub === userId &&
      typeof parsed.exp === "number" &&
      Number.isSafeInteger(parsed.exp) &&
      parsed.exp >= Math.floor(now / 1_000)
    );
  } catch {
    return false;
  }
}

export function recoveryMarkerCookieOptions() {
  return {
    httpOnly: true,
    maxAge: RECOVERY_MARKER_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
