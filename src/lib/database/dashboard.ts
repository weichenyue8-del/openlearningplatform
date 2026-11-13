import "server-only";

import { getCourseBySlug } from "@/content/course-catalog";
import {
  buildAccuracySeries,
  buildCourseProgress,
  buildCourseProgressSeries,
  buildOverview,
  buildRecentActivity,
  buildRecommendations,
  buildSubjectPerformance,
  buildTopicMastery,
  countCurrentCompletedLessons,
  type AttemptSignal,
  type EnrollmentRecord,
  type LessonProgressRecord,
  type PracticeSessionSummary,
} from "@/lib/learning/analytics";
import type {
  DashboardSnapshot,
  DataResult,
  MyLearningSnapshot,
  ProfileSnapshot,
  SavedResource,
} from "@/lib/learning/types";
import { createClient } from "@/lib/supabase/server";
import { getPracticeQuestionMetadata } from "@/practice/question-bank.server";
import { getResourceById } from "@/resources/catalog";

import { ownsRequestedUser, unauthorizedDataResult } from "./authorization";

type ProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type EnrollmentRow = {
  course_id: string;
  enrolled_at: string;
  last_accessed_at: string | null;
};

type LessonProgressRow = {
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

type PracticeSessionRow = {
  id: string;
  course_id: string;
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
};

type QuestionAttemptRow = {
  id: string;
  question_id: string;
  is_correct: boolean;
  created_at: string;
};

type BookmarkRow = {
  resource_id: string;
  created_at: string;
};

function rows<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function enrollmentRecords(value: unknown): EnrollmentRecord[] {
  return rows<EnrollmentRow>(value).map((row) => ({
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    lastAccessedAt: row.last_accessed_at,
  }));
}

function progressRecords(value: unknown): LessonProgressRecord[] {
  return rows<LessonProgressRow>(value).map((row) => ({
    courseId: row.course_id,
    lessonId: row.lesson_id,
    completed: row.completed,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  }));
}

function sessionRecords(value: unknown): PracticeSessionSummary[] {
  return rows<PracticeSessionRow>(value).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    completedAt: row.completed_at,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
  }));
}

function savedResourceRecords(value: unknown): SavedResource[] {
  return rows<BookmarkRow>(value).flatMap((row): SavedResource[] => {
    const resource = getResourceById(row.resource_id);
    if (!resource) return [];
    return [
      {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        provider: resource.provider,
        url: resource.url,
        savedAt: row.created_at,
      },
    ];
  });
}

function hasError(results: Array<{ error: unknown }>) {
  return results.some((result) => Boolean(result.error));
}

export async function getDashboardSnapshot(
  userId: string,
  fallbackDisplayName = "Student",
): Promise<DataResult<DashboardSnapshot>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured for this environment." };
  }

  const [
    profileResult,
    enrollmentResult,
    progressResult,
    sessionsResult,
    attemptsResult,
    bookmarksResult,
    attemptsCountResult,
    correctCountResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("course_enrollments")
      .select("course_id, enrolled_at, last_accessed_at")
      .eq("user_id", userId)
      .order("last_accessed_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("course_id, lesson_id, completed, completed_at, updated_at")
      .eq("user_id", userId),
    supabase
      .from("practice_sessions")
      .select("id, course_id, completed_at, total_questions, correct_answers")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(100),
    supabase
      .from("question_attempts")
      .select("id, question_id, is_correct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("resource_bookmarks")
      .select("resource_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_correct", true),
  ]);

  const results = [
    profileResult,
    enrollmentResult,
    progressResult,
    sessionsResult,
    attemptsResult,
    bookmarksResult,
    attemptsCountResult,
    correctCountResult,
  ];
  if (hasError(results)) {
    return {
      ok: false,
      error: "Your learning data could not be loaded. Please try again shortly.",
    };
  }

  const enrollments = enrollmentRecords(enrollmentResult.data);
  const progress = progressRecords(progressResult.data);
  const sessions = sessionRecords(sessionsResult.data);
  const savedResources = savedResourceRecords(bookmarksResult.data);
  const courseProgress = buildCourseProgress(enrollments, progress);
  const questionMeta = getPracticeQuestionMetadata();
  const metaById = new Map(questionMeta.map((question) => [question.id, question]));
  const attempts: AttemptSignal[] = rows<QuestionAttemptRow>(attemptsResult.data).flatMap(
    (row): AttemptSignal[] => {
      const question = metaById.get(row.question_id);
      if (!question) return [];
      return [
        {
          id: row.id,
          questionId: question.id,
          courseId: question.courseId,
          topicId: question.topicId,
          topicLabel: question.topicLabel,
          isCorrect: row.is_correct,
          attemptedAt: row.created_at,
        },
      ];
    },
  );
  const bookmarkActivity = savedResources.map((resource) => ({
    resourceId: resource.id,
    title: resource.title,
    createdAt: resource.savedAt,
  }));
  const profile = profileResult.data as ProfileRow | null;
  const questionsAnswered = attemptsCountResult.count ?? 0;
  const correctAnswers = correctCountResult.count ?? 0;

  return {
    ok: true,
    data: {
      displayName: profile?.display_name?.trim() || fallbackDisplayName,
      overview: buildOverview(
        courseProgress.length,
        countCurrentCompletedLessons(progress),
        questionsAnswered,
        correctAnswers,
      ),
      courses: courseProgress,
      recentActivity: buildRecentActivity(progress, sessions, bookmarkActivity),
      accuracy: buildAccuracySeries(sessions),
      courseProgress: buildCourseProgressSeries(courseProgress),
      subjectPerformance: buildSubjectPerformance(attempts),
      topicMastery: buildTopicMastery(attempts),
      recommendations: buildRecommendations(questionMeta, attempts, courseProgress),
      savedResources,
    },
  };
}

export async function getMyLearningSnapshot(
  userId: string,
): Promise<DataResult<MyLearningSnapshot>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured for this environment." };
  }
  const [enrollmentResult, progressResult, bookmarksResult] = await Promise.all([
    supabase
      .from("course_enrollments")
      .select("course_id, enrolled_at, last_accessed_at")
      .eq("user_id", userId)
      .order("last_accessed_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("course_id, lesson_id, completed, completed_at, updated_at")
      .eq("user_id", userId),
    supabase
      .from("resource_bookmarks")
      .select("resource_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  if (hasError([enrollmentResult, progressResult, bookmarksResult])) {
    return { ok: false, error: "Your learning library could not be loaded." };
  }
  return {
    ok: true,
    data: {
      courses: buildCourseProgress(
        enrollmentRecords(enrollmentResult.data),
        progressRecords(progressResult.data),
      ),
      savedResources: savedResourceRecords(bookmarksResult.data),
    },
  };
}

export async function getProfileSnapshot(
  userId: string,
  fallbackDisplayName = "Student",
): Promise<DataResult<ProfileSnapshot>> {
  if (!await ownsRequestedUser(userId)) return unauthorizedDataResult;
  const dashboard = await getDashboardSnapshot(userId, fallbackDisplayName);
  if (!dashboard.ok) return dashboard;
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured for this environment." };
  }
  const profileResult = await supabase
    .from("profiles")
    .select("display_name, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (profileResult.error || !profileResult.data) {
    return { ok: false, error: "Your profile could not be loaded." };
  }
  const profile = profileResult.data as ProfileRow;
  return {
    ok: true,
    data: {
      displayName: profile.display_name?.trim() || dashboard.data.displayName,
      avatarUrl: profile.avatar_url,
      joinedAt: profile.created_at,
      overview: dashboard.data.overview,
      courses: dashboard.data.courses,
    },
  };
}

export function getCourseTitle(courseId: string) {
  return getCourseBySlug(courseId)?.title;
}
