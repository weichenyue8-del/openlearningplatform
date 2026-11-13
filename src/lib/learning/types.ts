import type { CourseCategory, CourseIconName } from "@/content/course-catalog";

export type DashboardOverview = {
  enrolledCourses: number;
  completedLessons: number;
  questionsAnswered: number;
  overallAccuracy: number | null;
};

export type DashboardCourse = {
  courseId: string;
  title: string;
  shortTitle: string;
  category: CourseCategory;
  icon: CourseIconName;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number | null;
  lastAccessedAt: string | null;
  continueHref: string;
  continueLabel: string;
};

export type DashboardActivity =
  | {
      id: string;
      kind: "lesson-completed";
      title: string;
      detail: string;
      occurredAt: string;
      href: string;
    }
  | {
      id: string;
      kind: "practice-completed";
      title: string;
      detail: string;
      occurredAt: string;
      href: string;
    }
  | {
      id: string;
      kind: "resource-bookmarked";
      title: string;
      detail: string;
      occurredAt: string;
      href: string;
    };

export type AccuracyPoint = {
  id: string;
  label: string;
  accuracy: number;
  correct: number;
  total: number;
};

export type CourseProgressPoint = {
  courseId: string;
  label: string;
  progress: number;
  completed: number;
  total: number;
};

export type PerformancePoint = {
  id: string;
  label: string;
  accuracy: number;
  correct: number;
  attempts: number;
};

export type MasteryPoint = PerformancePoint & {
  estimatedMastery: number;
};

export type LearningRecommendation = {
  id: string;
  title: string;
  reason: string;
  href: string;
  kind: "lesson" | "practice";
};

export type SavedResource = {
  id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  savedAt: string;
};

export type DashboardSnapshot = {
  displayName: string;
  overview: DashboardOverview;
  courses: DashboardCourse[];
  recentActivity: DashboardActivity[];
  accuracy: AccuracyPoint[];
  courseProgress: CourseProgressPoint[];
  subjectPerformance: PerformancePoint[];
  topicMastery: MasteryPoint[];
  recommendations: LearningRecommendation[];
  savedResources: SavedResource[];
};

export type ProfileSnapshot = {
  displayName: string;
  avatarUrl: string | null;
  joinedAt: string;
  overview: DashboardOverview;
  courses: DashboardCourse[];
};

export type MyLearningSnapshot = {
  courses: DashboardCourse[];
  savedResources: SavedResource[];
};

export type UserPreferencesSnapshot = {
  displayName: string;
  theme: "light" | "dark" | "system";
  preferredSubjects: string[];
  deletionRequestedAt: string | null;
};

export type MistakeReviewItem = {
  id: string;
  questionId: string;
  prompt: string;
  courseId: string;
  courseTitle: string;
  topicId: string;
  topicLabel: string;
  submittedAnswer: string;
  correctAnswer: string;
  explanation: string;
  attemptedAt: string;
  reviewed: boolean;
  retryHref: string;
};

export type MistakeFilters = {
  courseId?: string;
  topicId?: string;
};

export type DataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
