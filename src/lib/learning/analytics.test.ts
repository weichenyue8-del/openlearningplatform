import { describe, expect, it } from "vitest";

import {
  buildCourseProgress,
  buildOverview,
  buildTopicMastery,
  countCurrentCompletedLessons,
  type AttemptSignal,
  type LessonProgressRecord,
} from "./analytics";

const progress: LessonProgressRecord[] = [
  {
    courseId: "ap-calculus-bc",
    lessonId: "limits-and-continuity",
    completed: true,
    completedAt: "2026-11-12T00:00:00.000Z",
    updatedAt: "2026-11-12T00:00:00.000Z",
  },
  {
    courseId: "ap-calculus-bc",
    lessonId: "removed-lesson",
    completed: true,
    completedAt: "2026-11-12T00:00:00.000Z",
    updatedAt: "2026-11-12T00:00:00.000Z",
  },
];

describe("learning analytics", () => {
  it("does not present zero attempts as observed zero-percent accuracy", () => {
    expect(buildOverview(0, 0, 0, 0).overallAccuracy).toBeNull();
    expect(buildOverview(1, 2, 3, 2).overallAccuracy).toBe(67);
  });

  it("uses current published lessons and ignores stale progress", () => {
    const result = buildCourseProgress(
      [
        {
          courseId: "ap-calculus-bc",
          enrolledAt: "2026-11-12T00:00:00.000Z",
          lastAccessedAt: null,
        },
      ],
      progress,
    );
    expect(result[0]).toMatchObject({
      completedLessons: 1,
      totalLessons: 3,
      completionPercentage: 33,
    });
    expect(countCurrentCompletedLessons(progress)).toBe(1);
  });

  it("represents courses without published lessons as indeterminate progress", () => {
    const result = buildCourseProgress(
      [
        {
          courseId: "ap-statistics",
          enrolledAt: "2026-11-12T00:00:00.000Z",
          lastAccessedAt: null,
        },
      ],
      [],
    );
    expect(result[0].completionPercentage).toBeNull();
  });

  it("labels confidence-adjusted mastery separately from observed accuracy", () => {
    const attempts: AttemptSignal[] = [
      {
        id: "a",
        questionId: "q1",
        courseId: "ap-calculus-bc",
        topicId: "limits",
        topicLabel: "Limits",
        isCorrect: true,
        attemptedAt: "2026-11-12T00:00:00.000Z",
      },
      {
        id: "b",
        questionId: "q2",
        courseId: "ap-calculus-bc",
        topicId: "limits",
        topicLabel: "Limits",
        isCorrect: false,
        attemptedAt: "2026-11-12T00:01:00.000Z",
      },
    ];
    expect(buildTopicMastery(attempts)[0]).toMatchObject({
      accuracy: 50,
      estimatedMastery: 50,
      attempts: 2,
    });
  });
});
