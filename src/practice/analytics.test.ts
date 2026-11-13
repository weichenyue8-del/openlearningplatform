import { describe, expect, it } from "vitest";

import {
  calculateAccuracy,
  calculateDifficultyPerformance,
  calculateTopicPerformance,
  isSessionComplete,
} from "./analytics";
import type { StoredAttempt } from "./types";

function attempt(id: string, topicId: string, topicLabel: string, correct: boolean, difficulty: "easy" | "medium" | "hard" = "easy"): StoredAttempt {
  return {
    question: {
      id,
      courseId: "course",
      unitId: "unit",
      unitLabel: "Unit",
      topicId,
      topicLabel,
      difficulty,
      type: "numerical",
      content: { prompt: id },
    },
    submittedAnswer: "1",
    result: {
      valid: true,
      correct,
      correctAnswer: "1",
      explanation: "Because.",
    },
    submittedAt: "2026-11-12T00:00:00.000Z",
  };
}

const attempts = [
  attempt("q1", "limits", "Limits", true, "easy"),
  attempt("q2", "limits", "Limits", false, "easy"),
  attempt("q3", "series", "Series", false, "hard"),
];

describe("practice analytics", () => {
  it("calculates actual totals and rounded accuracy", () => {
    expect(calculateAccuracy(attempts)).toEqual({ total: 3, correct: 1, incorrect: 2, accuracy: 33 });
    expect(calculateAccuracy([])).toEqual({ total: 0, correct: 0, incorrect: 0, accuracy: 0 });
  });

  it("tracks completion by unique question IDs", () => {
    expect(isSessionComplete(["q1", "q2"], attempts)).toBe(true);
    expect(isSessionComplete(["q1", "missing"], attempts)).toBe(false);
    expect(isSessionComplete([], attempts)).toBe(false);
  });

  it("groups performance by topic", () => {
    expect(calculateTopicPerformance(attempts)).toEqual([
      { topicId: "series", topicLabel: "Series", attempts: 1, correct: 0, incorrect: 1, accuracy: 0 },
      { topicId: "limits", topicLabel: "Limits", attempts: 2, correct: 1, incorrect: 1, accuracy: 50 },
    ]);
  });

  it("groups only attempted difficulties", () => {
    expect(calculateDifficultyPerformance(attempts)).toEqual([
      { difficulty: "easy", attempts: 2, correct: 1, incorrect: 1, accuracy: 50 },
      { difficulty: "hard", attempts: 1, correct: 0, incorrect: 1, accuracy: 0 },
    ]);
  });
});
