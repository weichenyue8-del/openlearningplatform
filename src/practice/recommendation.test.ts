import { describe, expect, it } from "vitest";

import { recommendQuestions } from "./recommendation";
import type { PracticeQuestionMeta, StoredAttempt } from "./types";

function meta(id: string, topicId: string, topicLabel: string): PracticeQuestionMeta {
  return {
    id,
    courseId: "course",
    unitId: "unit",
    unitLabel: "Unit",
    topicId,
    topicLabel,
    difficulty: "medium",
    type: "multiple-choice",
  };
}

function completed(
  question: PracticeQuestionMeta,
  correct: boolean,
  submittedAt = "2026-11-12T00:00:00.000Z",
): StoredAttempt {
  return {
    question: { ...question, content: { prompt: question.id } },
    submittedAnswer: "a",
    result: { valid: true, correct, correctAnswer: "A", explanation: "Explanation" },
    submittedAt,
  };
}

describe("recommendQuestions", () => {
  it("prioritizes weak topics and previously missed questions deterministically", () => {
    const strong = meta("strong", "derivatives", "Derivatives");
    const weak = meta("weak", "series", "Infinite Series");
    const attempts = [
      completed(strong, true),
      completed(strong, true),
      completed(weak, false),
      completed(weak, false),
    ];

    const ranked = recommendQuestions([strong, weak], attempts);
    expect(ranked[0].question.id).toBe("weak");
    expect(ranked[0].reason).toContain("previously missed");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("uses stable IDs to break equal scores", () => {
    const ranked = recommendQuestions([meta("b", "new", "New"), meta("a", "new", "New")], []);
    expect(ranked.map((item) => item.question.id)).toEqual(["a", "b"]);
  });

  it("uses the newest 40 timestamps when attempts arrive newest-first", () => {
    const question = meta("question", "topic", "Topic");
    const attempts = Array.from({ length: 41 }, (_, index) =>
      completed(
        question,
        index !== 0,
        new Date(Date.UTC(2026, 10, 12, 0, 40 - index)).toISOString(),
      ),
    );

    const [recommendation] = recommendQuestions([question], attempts);

    expect(recommendation.reason).toContain("previously missed");
  });
});
