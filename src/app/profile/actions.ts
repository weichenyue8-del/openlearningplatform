"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireViewer } from "@/lib/auth/session";
import { updateDisplayName } from "@/lib/database/profile";
import { createClient } from "@/lib/supabase/server";

const schema = z.string().trim().min(1).max(80);

export async function updateProfileAction(formData: FormData) {
  const viewer = await requireViewer("/profile");
  const parsed = schema.safeParse(formData.get("displayName"));
  if (!parsed.success) redirect("/profile?status=invalid-name");
  const supabase = await createClient({ cookieWrites: "required" });
  if (!supabase) redirect("/profile?status=configuration");
  const authUpdate = await supabase.auth.updateUser({ data: { display_name: parsed.data } });
  if (authUpdate.error) redirect("/profile?status=error");
  const result = await updateDisplayName(viewer.id, parsed.data);
  redirect(`/profile?status=${result.ok ? "saved" : "error"}`);
}
