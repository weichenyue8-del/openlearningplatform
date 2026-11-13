import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

import { sanitizeRedirectPath } from "./redirects";

export type AuthenticatedViewer = {
  id: string;
  email: string | null;
  displayName: string | null;
};

function getDisplayName(userMetadata: unknown): string | null {
  if (!userMetadata || typeof userMetadata !== "object") return null;

  const value = (userMetadata as Record<string, unknown>).display_name;
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 80) : null;
}

export const getOptionalViewer = cache(async (): Promise<AuthenticatedViewer | null> => {
  try {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getClaims();
    if (error || typeof data?.claims?.sub !== "string") return null;

    return {
      id: data.claims.sub,
      email: typeof data.claims.email === "string" ? data.claims.email : null,
      displayName: getDisplayName(data.claims.user_metadata),
    };
  } catch {
    return null;
  }
});

/**
 * Public learning content must never wait indefinitely for the optional
 * account layer. If the configured Auth service is slow or unavailable, the
 * page renders in guest mode and account controls can be retried later.
 */
export async function getOptionalPublicViewer(
  timeoutMs = 2_500,
): Promise<AuthenticatedViewer | null> {
  if (!isSupabaseConfigured()) return null;

  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getOptionalViewer(),
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function requireViewer(nextPath = "/dashboard"): Promise<AuthenticatedViewer> {
  const viewer = await getOptionalViewer();
  if (viewer) return viewer;

  const safeNextPath = sanitizeRedirectPath(nextPath);
  const query = new URLSearchParams({ next: safeNextPath });
  if (!isSupabaseConfigured()) query.set("error", "configuration");

  redirect(`/login?${query.toString()}`);
}
