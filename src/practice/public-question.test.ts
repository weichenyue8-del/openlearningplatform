import { describe, expect, it } from "vitest";

import { toPublicQuestion } from "./public-question";
import type { PracticeQuestion } from "./types";

describe("toPublicQuestion", () => {
  it("allowlists browser-safe fields without answers, tolerance, or explanations", () => {
    const privateQuestion: PracticeQuestion = {
      id: "leak-test",
      courseId: "course",
      unitId: "unit",
      unitLabel: "Unit",
      topicId: "topic",
      topicLabel: "Topic",
      difficulty: "hard",
      type: "numerical",
      content: { prompt: "Prompt" },
      grading: { kind: "numerical", value: 123456789, tolerance: 0.25 },
      answerDisplay: "PRIVATE_ANSWER_SENTINEL",
      explanation: "PRIVATE_EXPLANATION_SENTINEL",
    };

    const serialized = JSON.stringify(toPublicQuestion(privateQuestion));
    expect(serialized).not.toContain("PRIVATE_ANSWER_SENTINEL");
    expect(serialized).not.toContain("PRIVATE_EXPLANATION_SENTINEL");
    expect(serialized).not.toContain("123456789");
    expect(serialized).not.toContain("tolerance");
    expect(serialized).not.toContain("grading");
  });
});
