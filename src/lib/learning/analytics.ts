import {
  courses,
  getCourseBySlug,
  getCourseLessons,
  type CourseCategory,
} from "@/content/course-catalog";
import type { PracticeQuestionMeta } from "@/practice/types";

import { getKnownLesson, makeLessonKey } from "./identifiers";
import type {
  AccuracyPoint,
  CourseProgressPoint,
  DashboardActivity,
  DashboardCourse,
  DashboardOverview,
  LearningRecommendation,
  MasteryPoint,
  PerformancePoint,
} from "./types";

export type EnrollmentRecord = {
  courseId: string;
  enrolledAt: string;
  lastAccessedAt: string | null;
};

export type LessonProgressRecord = {
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type AttemptSignal = {
  id: string;
  questionId: string;
  courseId: string;
  topicId: string;
  topicLabel: string;
  isCorrect: boolean;
  attemptedAt: string;
};

export type PracticeSessionSummary = {
  id: string;
  courseId: string;
  completedAt: string | null;
  totalQuestions: number;
  correctAnswers: number;
};

export type BookmarkActivityRecord = {
  resourceId: string;
  title: string;
  createdAt: string;
};

function percentage(correct: number, total: number) {
  if (total <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((correct / total) * 100)));
}

export function buildOverview(
  enrolledCourses: number,
  completedLessons: number,
  questionsAnswered: number,
  correctAnswers: number,
): DashboardOverview {
  return {
    enrolledCourses,
    completedLessons,
    questionsAnswered,
    overallAccuracy: percentage(correctAnswers, questionsAnswered),
  };
}

export function buildCourseProgress(
  enrollments: EnrollmentRecord[],
  progressRecords: LessonProgressRecord[],
): DashboardCourse[] {
  const progressByCourse = new Map<string, Set<string>>();
  for (const record of progressRecords) {
    if (!record.completed || !getKnownLesson(record.courseId, record.lessonId)) continue;
    const completed = progressByCourse.get(record.courseId) ?? new Set<string>();
    completed.add(record.lessonId);
    progressByCourse.set(record.courseId, completed);
  }

  return enrollments
    .map((enrollment) => {
      const course = getCourseBySlug(enrollment.courseId);
      if (!course) return undefined;
      const lessons = getCourseLessons(course);
      const completed = progressByCourse.get(course.slug) ?? new Set<string>();
      const completedLessons = lessons.filter((lesson) => completed.has(lesson.slug)).length;
      const nextLesson = lessons.find((lesson) => !completed.has(lesson.slug));
      return {
        courseId: course.slug,
        title: course.title,
        shortTitle: course.shortTitle,
        category: course.category,
        icon: course.icon,
        completedLessons,
        totalLessons: lessons.length,
        completionPercentage: percentage(completedLessons, lessons.length),
        lastAccessedAt: enrollment.lastAccessedAt,
        continueHref: nextLesson
          ? `/courses/${course.slug}/${nextLesson.slug}`
          : `/courses/${course.slug}`,
        continueLabel: nextLesson
          ? "Continue Learning"
          : lessons.length > 0
            ? "Review Course"
            : "View Course",
      } satisfies DashboardCourse;
    })
    .filter((course): course is DashboardCourse => Boolean(course))
    .sort((a, b) =>
      (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? "") ||
      a.title.localeCompare(b.title),
    );
}

export function buildAccuracySeries(sessions: PracticeSessionSummary[]): AccuracyPoint[] {
  return sessions
    .filter(
      (session) =>
        Boolean(session.completedAt) &&
        session.totalQuestions > 0 &&
        session.correctAnswers >= 0 &&
        session.correctAnswers <= session.totalQuestions,
    )
    .sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""))
    .slice(-12)
    .map((session) => ({
      id: session.id,
      label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(session.completedAt as string),
      ),
      accuracy: percentage(session.correctAnswers, session.totalQuestions) ?? 0,
      correct: session.correctAnswers,
      total: session.totalQuestions,
    }));
}

export function buildCourseProgressSeries(coursesData: DashboardCourse[]): CourseProgressPoint[] {
  return coursesData
    .filter((course) => course.completionPercentage !== null)
    .map((course) => ({
      courseId: course.courseId,
      label: course.shortTitle,
      progress: course.completionPercentage ?? 0,
      completed: course.completedLessons,
      total: course.totalLessons,
    }));
}

export function buildSubjectPerformance(attempts: AttemptSignal[]): PerformancePoint[] {
  const grouped = new Map<CourseCategory, { correct: number; attempts: number }>();
  for (const attempt of attempts) {
    const category = getCourseBySlug(attempt.courseId)?.category;
    if (!category) continue;
    const current = grouped.get(category) ?? { correct: 0, attempts: 0 };
    current.attempts += 1;
    if (attempt.isCorrect) current.correct += 1;
    grouped.set(category, current);
  }

  return [...grouped.entries()]
    .map(([label, value]) => ({
      id: label,
      label,
      accuracy: percentage(value.correct, value.attempts) ?? 0,
      correct: value.correct,
      attempts: value.attempts,
    }))
    .sort((a, b) => b.attempts - a.attempts || a.label.localeCompare(b.label));
}

export function buildTopicMastery(attempts: AttemptSignal[]): MasteryPoint[] {
  const grouped = new Map<
    string,
    { label: string; correct: number; attempts: number }
  >();
  for (const attempt of attempts) {
    const key = `${attempt.courseId}:${attempt.topicId}`;
    const current = grouped.get(key) ?? {
      label: attempt.topicLabel,
      correct: 0,
      attempts: 0,
    };
    current.attempts += 1;
    if (attempt.isCorrect) current.correct += 1;
    grouped.set(key, current);
  }

  return [...grouped.entries()]
    .filter(([, value]) => value.attempts >= 2)
    .map(([id, value]) => ({
      id,
      label: value.label,
      accuracy: percentage(value.correct, value.attempts) ?? 0,
      estimatedMastery: Math.round(((value.correct + 1) / (value.attempts + 2)) * 100),
      correct: value.correct,
      attempts: value.attempts,
    }))
    .sort((a, b) => a.estimatedMastery - b.estimatedMastery || a.label.localeCompare(b.label))
    .slice(0, 8);
}

export function buildRecentActivity(
  progress: LessonProgressRecord[],
  sessions: PracticeSessionSummary[],
  bookmarks: BookmarkActivityRecord[],
): DashboardActivity[] {
  const lessonActivity = progress.flatMap((record): DashboardActivity[] => {
    if (!record.completed || !record.completedAt) return [];
    const resolved = getKnownLesson(record.courseId, record.lessonId);
    if (!resolved) return [];
    return [
      {
        id: `lesson:${makeLessonKey(record.courseId, record.lessonId)}`,
        kind: "lesson-completed",
        title: `Completed ${resolved.lesson.title}`,
        detail: resolved.course.title,
        occurredAt: record.completedAt,
        href: `/courses/${record.courseId}/${record.lessonId}`,
      },
    ];
  });

  const practiceActivity = sessions.flatMap((session): DashboardActivity[] => {
    if (!session.completedAt || session.totalQuestions <= 0) return [];
    const course = getCourseBySlug(session.courseId);
    if (!course) return [];
    return [
      {
        id: `practice:${session.id}`,
        kind: "practice-completed",
        title: `Finished ${course.shortTitle} practice`,
        detail: `${session.correctAnswers} of ${session.totalQuestions} correct`,
        occurredAt: session.completedAt,
        href: `/practice/results/${session.id}`,
      },
    ];
  });

  const bookmarkActivity: DashboardActivity[] = bookmarks.map((bookmark) => ({
    id: `bookmark:${bookmark.resourceId}`,
    kind: "resource-bookmarked",
    title: `Saved ${bookmark.title}`,
    detail: "Learning resource",
    occurredAt: bookmark.createdAt,
    href: "/my-learning#saved-resources",
  }));

  return [...lessonActivity, ...practiceActivity, ...bookmarkActivity]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id))
    .slice(0, 8);
}

export function buildRecommendations(
  questionMeta: PracticeQuestionMeta[],
  attempts: AttemptSignal[],
  courseProgress: DashboardCourse[],
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  const recentCourse = courseProgress.find((course) => course.totalLessons > 0);
  if (recentCourse) {
    recommendations.push({
      id: `lesson:${recentCourse.courseId}`,
      title: `Continue ${recentCourse.shortTitle}`,
      reason:
        recentCourse.completedLessons > 0
          ? `${recentCourse.completedLessons} of ${recentCourse.totalLessons} lessons completed`
          : "Pick up with the first published lesson",
      href: recentCourse.continueHref,
      kind: "lesson",
    });
  }

  const mastery = buildTopicMastery(attempts);
  const weakest = mastery[0];
  const weakQuestion = weakest
    ? questionMeta.find(
        (question) => `${question.courseId}:${question.topicId}` === weakest.id,
      )
    : undefined;
  if (weakQuestion) {
    recommendations.push({
      id: `practice:${weakQuestion.id}`,
      title: `Strengthen ${weakQuestion.topicLabel}`,
      reason: `${weakest?.accuracy}% observed accuracy across ${weakest?.attempts} recent attempts`,
      href: `/practice/${weakQuestion.courseId}?topic=${encodeURIComponent(weakQuestion.topicId)}`,
      kind: "practice",
    });
  } else {
    const attemptedIds = new Set(attempts.map((attempt) => attempt.questionId));
    const nextQuestion = questionMeta.find((question) => !attemptedIds.has(question.id));
    if (nextQuestion) {
      recommendations.push({
        id: `practice:${nextQuestion.id}`,
        title: `Practice ${nextQuestion.topicLabel}`,
        reason: "Build evidence in a topic you have not practiced yet",
        href: `/practice/${nextQuestion.courseId}?topic=${encodeURIComponent(nextQuestion.topicId)}`,
        kind: "practice",
      });
    }
  }

  return recommendations.slice(0, 3);
}

export function countCurrentCompletedLessons(progress: LessonProgressRecord[]) {
  return new Set(
    progress
      .filter(
        (record) => record.completed && Boolean(getKnownLesson(record.courseId, record.lessonId)),
      )
      .map((record) => makeLessonKey(record.courseId, record.lessonId)),
  ).size;
}

export const publishedCourseIds = new Set(courses.map((course) => course.slug));
