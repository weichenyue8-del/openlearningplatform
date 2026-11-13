import { describe, expect, it } from "vitest";

import { evaluateAnswer, normalizeShortAnswer, parseFiniteNumber } from "./evaluation";
import type { PracticeQuestion, QuestionGradingRule } from "./types";

function question(grading: QuestionGradingRule): PracticeQuestion {
  return {
    id: "test-question",
    courseId: "test-course",
    unitId: "test-unit",
    unitLabel: "Test Unit",
    topicId: "test-topic",
    topicLabel: "Test Topic",
    difficulty: "medium",
    type: grading.kind,
    content: { prompt: "Test prompt" },
    options: grading.kind === "multiple-choice" || grading.kind === "multiple-select"
      ? [
          { id: "a", text: "A" },
          { id: "b", text: "B" },
          { id: "c", text: "C" },
          { id: "d", text: "D" },
        ]
      : undefined,
    grading,
    answerDisplay: "Answer",
    explanation: "Explanation",
  };
}

describe("evaluateAnswer", () => {
  it("evaluates multiple-choice answers and rejects unknown options", () => {
    const item = question({ kind: "multiple-choice", correctOptionId: "b" });
    expect(evaluateAnswer(item, "b")).toMatchObject({ valid: true, correct: true });
    expect(evaluateAnswer(item, "a")).toMatchObject({ valid: true, correct: false });
    expect(evaluateAnswer(item, "unknown")).toEqual({ valid: false, error: "Choose one of the available answers." });
  });

  it("compares multiple-select answers as complete order-independent sets", () => {
    const item = question({ kind: "multiple-select", correctOptionIds: ["a", "c"] });
    expect(evaluateAnswer(item, ["c", "a"])).toMatchObject({ valid: true, correct: true });
    expect(evaluateAnswer(item, ["a"])).toMatchObject({ valid: true, correct: false });
    expect(evaluateAnswer(item, ["a", "b", "c"])).toMatchObject({ valid: true, correct: false });
    expect(evaluateAnswer(item, [])).toMatchObject({ valid: false });
  });

  it("uses inclusive numerical tolerance and rejects invalid finite-number input", () => {
    const item = question({ kind: "numerical", value: 10, tolerance: 0.1 });
    expect(evaluateAnswer(item, "10")).toMatchObject({ valid: true, correct: true });
    expect(evaluateAnswer(item, "10.1")).toMatchObject({ valid: true, correct: true });
    expect(evaluateAnswer(item, "9.899")).toMatchObject({ valid: true, correct: false });
    expect(evaluateAnswer(item, "")).toMatchObject({ valid: false });
    expect(evaluateAnswer(item, "NaN")).toMatchObject({ valid: false });
    expect(evaluateAnswer(item, "Infinity")).toMatchObject({ valid: false });
    expect(evaluateAnswer(item, "10abc")).toMatchObject({ valid: false });
  });

  it("normalizes deterministic short answers without semantic guessing", () => {
    const item = question({ kind: "short-answer", acceptedAnswers: ["method overloading"] });
    expect(evaluateAnswer(item, "  METHOD   OVERLOADING ")).toMatchObject({ valid: true, correct: true });
    expect(evaluateAnswer(item, "method overriding")).toMatchObject({ valid: true, correct: false });
    expect(evaluateAnswer(item, ["method overloading"])).toMatchObject({ valid: false });
    expect(normalizeShortAnswer("  U = X² ")).toBe("u = x2");
  });
});

describe("parseFiniteNumber", () => {
  it("supports decimals, negatives, and scientific notation", () => {
    expect(parseFiniteNumber("-.5")).toBe(-0.5);
    expect(parseFiniteNumber("1e-3")).toBe(0.001);
    expect(parseFiniteNumber("1,000")).toBeUndefined();
  });
});
