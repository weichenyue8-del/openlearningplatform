import "server-only";

import type { DataResult, UserPreferencesSnapshot } from "@/lib/learning/types";
import { createClient } from "@/lib/supabase/server";

import { ownsRequestedUser, unauthorizedDataResult } from "./authorization";

const allowedSubjects = new Set([
  "Mathematics",
  "Computer Science",
  "Economics",
  "Science",
  "Social Science",
  "English",
]);

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<DataResult<{ displayName: string }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId);
  if (error) return { ok: false, error: "Your display name could not be updated." };
  return { ok: true, data: { displayName } };
}

export async function getUserPreferences(
  userId: string,
): Promise<DataResult<UserPreferencesSnapshot>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const [preferencesResult, deletionResult, profileResult] = await Promise.all([
    supabase
      .from("user_preferences")
      .select("theme, preferred_subjects")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("account_deletion_requests")
      .select("requested_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  if (preferencesResult.error || deletionResult.error || profileResult.error) {
    return { ok: false, error: "Your account preferences could not be loaded." };
  }
  const preferences = preferencesResult.data as
    | { theme: string; preferred_subjects: string[] | null }
    | null;
  const theme = ["light", "dark", "system"].includes(preferences?.theme ?? "")
    ? (preferences?.theme as "light" | "dark" | "system")
    : "system";
  return {
    ok: true,
    data: {
      displayName:
        (profileResult.data as { display_name: string | null } | null)?.display_name?.trim() ||
        "Student",
      theme,
      preferredSubjects: (preferences?.preferred_subjects ?? []).filter((subject) =>
        allowedSubjects.has(subject),
      ),
      deletionRequestedAt:
        (deletionResult.data as { requested_at: string } | null)?.requested_at ?? null,
    },
  };
}

export async function updateUserPreferences(
  userId: string,
  theme: "light" | "dark" | "system",
  preferredSubjects: string[],
): Promise<DataResult<{ theme: string; preferredSubjects: string[] }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const normalizedSubjects = [...new Set(preferredSubjects)].filter((subject) =>
    allowedSubjects.has(subject),
  );
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      theme,
      preferred_subjects: normalizedSubjects,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: "Your preferences could not be updated." };
  return { ok: true, data: { theme, preferredSubjects: normalizedSubjects } };
}

export async function requestAccountDeletion(
  userId: string,
): Promise<DataResult<{ status: "pending" }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const existing = await supabase
    .from("account_deletion_requests")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();
  if (existing.error) {
    return { ok: false, error: "The deletion request status could not be checked." };
  }
  if (existing.data) return { ok: true, data: { status: "pending" } };
  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({ user_id: userId });
  if (error && error.code !== "23505") {
    return { ok: false, error: "Your deletion request could not be recorded." };
  }
  return { ok: true, data: { status: "pending" } };
}
