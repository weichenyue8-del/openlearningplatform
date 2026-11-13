import { describe, expect, it } from "vitest";

import { guestLearningImportSchema } from "./guest-import";

const timestamp = "2026-11-13T00:00:00.000Z";

describe("guest learning import boundary", () => {
  it("accepts the minimal projected data needed for server validation", () => {
    const parsed = guestLearningImportSchema.safeParse({
      version: 1,
      enrollments: [{ courseId: "ap-calculus-bc", enrolledAt: timestamp, lastAccessedAt: timestamp }],
      lessonProgress: [{ lessonKey: "ap-calculus-bc/limits-and-continuity", completed: true, updatedAt: timestamp }],
      bookmarks: [{ resourceId: "math-3b1b-calculus-essence", savedAt: timestamp }],
      practiceSessions: [{
        sourceId: "guest-session-123",
        courseId: "ap-calculus-bc",
        questionIds: ["calc-limits-001"],
        startedAt: timestamp,
        attempts: [{ questionId: "calc-limits-001", answer: "a", submittedAt: timestamp }],
      }],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects locally supplied correctness and answer explanations", () => {
    const parsed = guestLearningImportSchema.safeParse({
      version: 1,
      enrollments: [],
      lessonProgress: [],
      bookmarks: [],
      practiceSessions: [{
        sourceId: "guest-session-123",
        courseId: "ap-calculus-bc",
        questionIds: ["calc-limits-001"],
        startedAt: timestamp,
        attempts: [{
          questionId: "calc-limits-001",
          answer: "b",
          submittedAt: timestamp,
          correct: true,
          explanation: "untrusted",
        }],
      }],
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects oversized snapshots", () => {
    const parsed = guestLearningImportSchema.safeParse({
      version: 1,
      enrollments: [],
      lessonProgress: [],
      bookmarks: Array.from({ length: 201 }, (_, index) => ({
        resourceId: `resource-${index}`,
        savedAt: timestamp,
      })),
      practiceSessions: [],
    });

    expect(parsed.success).toBe(false);
  });
});
