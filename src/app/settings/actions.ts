"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireViewer } from "@/lib/auth/session";
import {
  requestAccountDeletion,
  updateDisplayName,
  updateUserPreferences,
} from "@/lib/database/profile";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(254);
const displayNameSchema = z.string().trim().min(1).max(80);
const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(1_024),
  password: z.string().min(12).max(1_024),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"] });
const themeSchema = z.enum(["light", "dark", "system"]);

export async function updateEmailAction(formData: FormData) {
  await requireViewer("/settings");
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) redirect("/settings?status=invalid-email");
  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) redirect("/settings?status=configuration");
  const { error } = await supabase.auth.updateUser({ email: parsed.data });
  redirect(`/settings?status=${error ? "email-error" : "email-verification"}`);
}

export async function updateSettingsDisplayNameAction(formData: FormData) {
  const viewer = await requireViewer("/settings");
  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) redirect("/settings?status=invalid-name");
  const result = await updateDisplayName(viewer.id, parsed.data);
  redirect(`/settings?status=${result.ok ? "name-saved" : "name-error"}`);
}

export async function updateAccountPasswordAction(formData: FormData) {
  await requireViewer("/settings");
  const parsed = passwordSchema.safeParse({ currentPassword: formData.get("currentPassword"), password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
  if (!parsed.success) redirect("/settings?status=invalid-password");
  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) redirect("/settings?status=configuration");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password, current_password: parsed.data.currentPassword });
  redirect(`/settings?status=${error ? "password-error" : "password-saved"}`);
}

export async function updateAppearanceAction(formData: FormData) {
  const viewer = await requireViewer("/settings");
  const theme = themeSchema.safeParse(formData.get("theme"));
  if (!theme.success) redirect("/settings?status=appearance-error");
  const subjects = formData.getAll("subjects").filter((value): value is string => typeof value === "string");
  const result = await updateUserPreferences(viewer.id, theme.data, subjects);
  if (result.ok) {
    const store = await cookies();
    store.set("openap-theme", theme.data, { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 31_536_000 });
  }
  redirect(`/settings?status=${result.ok ? "appearance-saved" : "appearance-error"}`);
}

export async function requestDeletionAction(formData: FormData) {
  const viewer = await requireViewer("/settings");
  if (formData.get("confirmation") !== "DELETE") redirect("/settings?status=deletion-confirmation");
  const result = await requestAccountDeletion(viewer.id);
  redirect(`/settings?status=${result.ok ? "deletion-requested" : "deletion-error"}`);
}
