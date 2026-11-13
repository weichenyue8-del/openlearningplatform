import "server-only";

import { createHash } from "node:crypto";

import type { GuestImportReport, GuestLearningImport } from "@/lib/learning/guest-import";
import { getKnownCourse, isKnownResourceId, parseLessonKey } from "@/lib/learning/identifiers";
import type { DataResult } from "@/lib/learning/types";
import { createClient } from "@/lib/supabase/server";
import { getPracticeQuestionById } from "@/practice/question-bank.server";

import { ownsRequestedUser, unauthorizedDataResult } from "./authorization";

function stableUuid(value: string) {
  const bytes = Buffer.from(createHash("sha256").update(value).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function safeTimestamp(value: string, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  if (timestamp < Date.UTC(2020, 0, 1) || timestamp > now + 5 * 60_000) return undefined;
  return new Date(timestamp).toISOString();
}

export async function importGuestLearning(
  userId: string,
  snapshot: GuestLearningImport,
): Promise<DataResult<GuestImportReport>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const report: GuestImportReport = {
    status: "complete",
    imported: { enrollments: 0, lessonProgress: 0, bookmarks: 0, practiceAttempts: 0 },
    skipped: { enrollments: 0, lessonProgress: 0, bookmarks: 0, practiceAttempts: 0 },
    messages: [],
  };
  const now = Date.now();

  const existingEnrollments = await supabase
    .from("course_enrollments")
    .select("course_id, enrolled_at, last_accessed_at")
    .eq("user_id", userId);
  if (existingEnrollments.error) {
    return { ok: false, error: "Existing learning data could not be checked safely." };
  }
  const enrollmentByCourse = new Map(
    (existingEnrollments.data ?? []).map((row) => [row.course_id, row]),
  );
  const importedCourseIds = new Set<string>();
  const normalizedEnrollments = snapshot.enrollments.flatMap((item) => {
    const course = getKnownCourse(item.courseId);
    const enrolledAt = safeTimestamp(item.enrolledAt, now);
    const lastAccessedAt = safeTimestamp(item.lastAccessedAt, now);
    if (!course || !enrolledAt || !lastAccessedAt || importedCourseIds.has(course.slug)) {
      report.skipped.enrollments += 1;
      return [];
    }
    importedCourseIds.add(course.slug);
    const cloud = enrollmentByCourse.get(course.slug);
    return [{
      user_id: userId,
      course_id: course.slug,
      enrolled_at: cloud?.enrolled_at && cloud.enrolled_at < enrolledAt ? cloud.enrolled_at : enrolledAt,
      last_accessed_at:
        cloud?.last_accessed_at && cloud.last_accessed_at > lastAccessedAt
          ? cloud.last_accessed_at
          : lastAccessedAt,
    }];
  });
  if (normalizedEnrollments.length > 0) {
    const result = await supabase.from("course_enrollments").upsert(normalizedEnrollments, {
      onConflict: "user_id,course_id",
    });
    if (result.error) {
      report.status = "partial";
      report.skipped.enrollments += normalizedEnrollments.length;
      report.messages.push("Course enrollments could not be imported.");
    } else {
      report.imported.enrollments += normalizedEnrollments.length;
    }
  }

  const existingProgress = await supabase
    .from("lesson_progress")
    .select("course_id, lesson_id, updated_at")
    .eq("user_id", userId);
  if (existingProgress.error) {
    report.status = "partial";
    report.skipped.lessonProgress += snapshot.lessonProgress.length;
    report.messages.push("Lesson progress could not be compared with cloud data.");
  } else {
    const progressByKey = new Map(
      (existingProgress.data ?? []).map((row) => [`${row.course_id}/${row.lesson_id}`, row]),
    );
    const seen = new Set<string>();
    const normalizedProgress = snapshot.lessonProgress.flatMap((item) => {
      const lesson = parseLessonKey(item.lessonKey);
      const updatedAt = safeTimestamp(item.updatedAt, now);
      if (!lesson || !updatedAt || seen.has(lesson.key)) {
        report.skipped.lessonProgress += 1;
        return [];
      }
      seen.add(lesson.key);
      const cloud = progressByKey.get(lesson.key);
      if (cloud && cloud.updated_at >= updatedAt) {
        report.skipped.lessonProgress += 1;
        return [];
      }
      return [{
        user_id: userId,
        course_id: lesson.courseId,
        lesson_id: lesson.lessonId,
        completed: item.completed,
        completed_at: item.completed ? updatedAt : null,
        updated_at: updatedAt,
      }];
    });
    if (normalizedProgress.length > 0) {
      const result = await supabase.from("lesson_progress").upsert(normalizedProgress, {
        onConflict: "user_id,course_id,lesson_id",
      });
      if (result.error) {
        report.status = "partial";
        report.skipped.lessonProgress += normalizedProgress.length;
        report.messages.push("Lesson progress could not be imported.");
      } else {
        report.imported.lessonProgress += normalizedProgress.length;
      }
    }
  }

  const seenBookmarks = new Set<string>();
  const bookmarks = snapshot.bookmarks.flatMap((item) => {
    const savedAt = safeTimestamp(item.savedAt, now);
    if (!savedAt || !isKnownResourceId(item.resourceId) || seenBookmarks.has(item.resourceId)) {
      report.skipped.bookmarks += 1;
      return [];
    }
    seenBookmarks.add(item.resourceId);
    return [{ user_id: userId, resource_id: item.resourceId, created_at: savedAt }];
  });
  if (bookmarks.length > 0) {
    const result = await supabase.from("resource_bookmarks").upsert(bookmarks, {
      onConflict: "user_id,resource_id",
      ignoreDuplicates: true,
    });
    if (result.error) {
      report.status = "partial";
      report.skipped.bookmarks += bookmarks.length;
      report.messages.push("Bookmarks could not be imported.");
    } else {
      report.imported.bookmarks += bookmarks.length;
    }
  }

  for (const session of snapshot.practiceSessions) {
    const course = getKnownCourse(session.courseId);
    const startedAt = safeTimestamp(session.startedAt, now);
    const questionIds = [...new Set(session.questionIds)];
    const validQuestions = questionIds.every((questionId) => {
      const question = getPracticeQuestionById(questionId);
      return question?.courseId === session.courseId;
    });
    if (!course || !startedAt || questionIds.length === 0 || !validQuestions) {
      report.skipped.practiceAttempts += session.attempts.length;
      continue;
    }
    const planned = new Set(questionIds);
    const sessionId = stableUuid(`guest-session:${userId}:${session.sourceId}`);
    const seenQuestions = new Set<string>();
    for (const attempt of session.attempts) {
      const question = getPracticeQuestionById(attempt.questionId);
      const submittedAt = safeTimestamp(attempt.submittedAt, now);
      if (
        !question ||
        question.courseId !== course.slug ||
        !planned.has(question.id) ||
        !submittedAt ||
        seenQuestions.has(question.id)
      ) {
        report.skipped.practiceAttempts += 1;
        continue;
      }
      seenQuestions.add(question.id);
      const submissionSource = attempt.sourceId ?? `${session.sourceId}:${question.id}`;
      const submissionId = stableUuid(`guest-attempt:${userId}:${submissionSource}`);
      const result = await supabase.rpc("record_practice_attempt", {
        p_session_id: sessionId,
        p_submission_id: submissionId,
        p_course_id: course.slug,
        p_question_ids: questionIds,
        p_question_id: question.id,
        p_submitted_answer: attempt.answer,
      });
      if (result.error) {
        report.status = "partial";
        report.skipped.practiceAttempts += 1;
        if (!report.messages.includes("Some practice attempts could not be imported.")) {
          report.messages.push("Some practice attempts could not be imported.");
        }
      } else {
        report.imported.practiceAttempts += 1;
      }
    }
  }

  return { ok: true, data: report };
}
