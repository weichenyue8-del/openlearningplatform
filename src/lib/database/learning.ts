import "server-only";

import { getKnownCourse, getKnownLesson, isKnownResourceId } from "@/lib/learning/identifiers";
import type { DataResult } from "@/lib/learning/types";
import { createClient } from "@/lib/supabase/server";

import { ownsRequestedUser, unauthorizedDataResult } from "./authorization";

const databaseUnavailable = {
  ok: false,
  error: "Supabase is not configured for this environment.",
} as const;

export async function enrollInCourse(
  userId: string,
  courseId: string,
): Promise<DataResult<{ courseId: string }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!getKnownCourse(courseId)) {
    return { ok: false, error: "That course could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { error } = await supabase.from("course_enrollments").upsert(
    {
      user_id: userId,
      course_id: courseId,
      last_accessed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
  if (error) return { ok: false, error: "The course could not be added to your learning list." };
  return { ok: true, data: { courseId } };
}

export async function leaveCourse(
  userId: string,
  courseId: string,
): Promise<DataResult<{ courseId: string }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!getKnownCourse(courseId)) {
    return { ok: false, error: "That course could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { error } = await supabase
    .from("course_enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (error) return { ok: false, error: "The course could not be removed." };
  return { ok: true, data: { courseId } };
}

export async function setLessonCompletion(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean,
): Promise<DataResult<{ courseId: string; lessonId: string; completed: boolean }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!getKnownLesson(courseId, lessonId)) {
    return { ok: false, error: "That lesson could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const now = new Date().toISOString();
  const enrollment = await supabase.from("course_enrollments").upsert(
    { user_id: userId, course_id: courseId, last_accessed_at: now },
    { onConflict: "user_id,course_id" },
  );
  if (enrollment.error) {
    return { ok: false, error: "Your course enrollment could not be updated." };
  }
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? now : null,
      updated_at: now,
    },
    { onConflict: "user_id,course_id,lesson_id" },
  );
  if (error) return { ok: false, error: "Your lesson progress could not be saved." };
  return { ok: true, data: { courseId, lessonId, completed } };
}

export async function saveResourceBookmark(
  userId: string,
  resourceId: string,
): Promise<DataResult<{ resourceId: string; saved: true }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!isKnownResourceId(resourceId)) {
    return { ok: false, error: "That learning resource could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { error } = await supabase.from("resource_bookmarks").upsert(
    { user_id: userId, resource_id: resourceId },
    { onConflict: "user_id,resource_id", ignoreDuplicates: true },
  );
  if (error) return { ok: false, error: "The resource could not be saved." };
  return { ok: true, data: { resourceId, saved: true } };
}

export async function removeResourceBookmark(
  userId: string,
  resourceId: string,
): Promise<DataResult<{ resourceId: string; saved: false }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!isKnownResourceId(resourceId)) {
    return { ok: false, error: "That learning resource could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { error } = await supabase
    .from("resource_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("resource_id", resourceId);
  if (error) return { ok: false, error: "The resource could not be removed." };
  return { ok: true, data: { resourceId, saved: false } };
}

export async function getEnrollmentState(
  userId: string,
  courseId: string,
): Promise<DataResult<{ enrolled: boolean }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!getKnownCourse(courseId)) return { ok: false, error: "That course could not be found." };
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) return { ok: false, error: "Your enrollment status could not be loaded." };
  return { ok: true, data: { enrolled: Boolean(data) } };
}

export async function getLessonCompletionState(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<DataResult<{ completed: boolean }>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  if (!getKnownLesson(courseId, lessonId)) {
    return { ok: false, error: "That lesson could not be found." };
  }
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("completed")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) return { ok: false, error: "Your lesson progress could not be loaded." };
  return { ok: true, data: { completed: Boolean(data?.completed) } };
}

export async function getResourceBookmarkIds(
  userId: string,
): Promise<DataResult<string[]>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return databaseUnavailable;
  const { data, error } = await supabase
    .from("resource_bookmarks")
    .select("resource_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: "Saved resources could not be loaded." };
  const ids = (data ?? [])
    .map((row) => row.resource_id)
    .filter((id): id is string => typeof id === "string" && isKnownResourceId(id));
  return { ok: true, data: [...new Set(ids)] };
}
