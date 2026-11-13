import { describe, expect, it } from "vitest";

import type { StoredAttempt } from "@/practice/types";

import { recommendResources } from "./recommendation";
import type { LearningResource } from "./types";

function resource(overrides: Partial<LearningResource> & Pick<LearningResource, "id">): LearningResource {
  const { id, ...rest } = overrides;
  return {
    id,
    title: id,
    description: "Description",
    provider: "Provider",
    type: "online-course",
    subject: "Mathematics",
    difficulty: "intermediate",
    access: "free-access",
    url: `https://example.com/${id}`,
    courseIds: [],
    topicIds: [],
    topicLabels: [],
    lessonRefs: [],
    attribution: "Provider",
    verified: true,
    lastVerifiedAt: "2026-11-12",
    addedAt: "2026-11-12",
    editorialOrder: 10,
    ...rest,
  };
}

function attempt({
  courseId = "course",
  topicId = "topic",
  topicLabel = "Topic",
  correct,
  submittedAt,
}: {
  courseId?: string;
  topicId?: string;
  topicLabel?: string;
  correct: boolean;
  submittedAt: string;
}): StoredAttempt {
  return {
    question: {
      id: `${courseId}-${topicId}-${submittedAt}`,
      courseId,
      unitId: "unit",
      unitLabel: "Unit",
      topicId,
      topicLabel,
      difficulty: "medium",
      type: "multiple-choice",
      content: { prompt: "Prompt" },
    },
    submittedAnswer: "answer",
    result: {
      valid: true,
      correct,
      correctAnswer: "answer",
      explanation: "Explanation",
    },
    submittedAt,
  };
}

describe("resource recommendations", () => {
  it("has a deterministic featured-resource cold start independent of input order", () => {
    const resources = [
      resource({ id: "z-featured", featured: true }),
      resource({ id: "not-featured", editorialOrder: 0 }),
      resource({ id: "a-featured", featured: true }),
    ];

    const forward = recommendResources(resources, []);
    const reversed = recommendResources([...resources].reverse(), []);

    expect(forward.map(({ resource: item }) => item.id)).toEqual([
      "a-featured",
      "z-featured",
      "not-featured",
    ]);
    expect(reversed.map(({ resource: item }) => item.id)).toEqual(
      forward.map(({ resource: item }) => item.id),
    );
    expect(forward.every(({ reason }) => reason.includes("Curated by OpenAP"))).toBe(true);
  });

  it("weights an explicit topic match ahead of a course-only match", () => {
    const ranked = recommendResources(
      [
        resource({ id: "unrelated" }),
        resource({ id: "course-only", courseIds: ["course"] }),
        resource({ id: "topic-only", courseIds: ["other"], topicIds: ["topic"] }),
        resource({ id: "exact", courseIds: ["course"], topicIds: ["topic"] }),
      ],
      [],
      { courseId: "course", topicId: "topic", topicLabel: "Infinite Series" },
    );

    expect(ranked.map(({ resource: item }) => item.id)).toEqual([
      "exact",
      "topic-only",
      "course-only",
      "unrelated",
    ]);
    expect(ranked[0].reason).toBe("Directly supports Infinite Series");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
    expect(ranked[1].score).toBeGreaterThan(ranked[2].score);
  });

  it("prioritizes weak topics and rewards the matching difficulty", () => {
    const attempts = [
      attempt({ topicId: "weak", topicLabel: "Infinite Series", correct: false, submittedAt: "2026-11-12T00:04:00.000Z" }),
      attempt({ topicId: "weak", topicLabel: "Infinite Series", correct: false, submittedAt: "2026-11-12T00:03:00.000Z" }),
      attempt({ topicId: "weak", topicLabel: "Infinite Series", correct: false, submittedAt: "2026-11-12T00:02:00.000Z" }),
      attempt({ topicId: "weak", topicLabel: "Infinite Series", correct: true, submittedAt: "2026-11-12T00:01:00.000Z" }),
      attempt({ topicId: "strong", topicLabel: "Derivatives", correct: true, submittedAt: "2026-11-12T00:00:00.000Z" }),
    ];

    const ranked = recommendResources(
      [
        resource({ id: "strong-advanced", courseIds: ["course"], topicIds: ["strong"], difficulty: "advanced" }),
        resource({ id: "weak-advanced", courseIds: ["course"], topicIds: ["weak"], difficulty: "advanced" }),
        resource({ id: "course-beginner", courseIds: ["course"], topicIds: ["other"], difficulty: "beginner" }),
        resource({ id: "weak-beginner", courseIds: ["course"], topicIds: ["weak"], difficulty: "beginner" }),
      ],
      attempts,
    );

    const weakBeginner = ranked.find(({ resource: item }) => item.id === "weak-beginner");
    const weakAdvanced = ranked.find(({ resource: item }) => item.id === "weak-advanced");
    const courseBeginner = ranked.find(({ resource: item }) => item.id === "course-beginner");

    expect(ranked[0].resource.id).toBe("weak-beginner");
    expect(weakBeginner?.reason).toBe("Reinforce Infinite Series after 25% recent accuracy");
    expect(weakBeginner!.score - weakAdvanced!.score).toBeCloseTo(0.12);
    expect(courseBeginner?.reason).toBe("Continue learning in course");
  });

  it("uses the newest 60 dated attempts regardless of input order", () => {
    const attempts = Array.from({ length: 61 }, (_, index) =>
      attempt({
        correct: index !== 0,
        submittedAt: new Date(Date.UTC(2026, 10, 12, 0, index)).toISOString(),
      }),
    );
    const resources = [
      resource({ id: "beginner", courseIds: ["course"], topicIds: ["topic"], difficulty: "beginner" }),
      resource({ id: "advanced", courseIds: ["course"], topicIds: ["topic"], difficulty: "advanced" }),
    ];
    const interleaved = attempts.filter((_, index) => index % 2 === 0)
      .concat(attempts.filter((_, index) => index % 2 === 1));

    const chronological = recommendResources(resources, attempts);
    const reverseChronological = recommendResources(resources, [...attempts].reverse());
    const mixed = recommendResources(resources, interleaved);

    const snapshot = chronological.map(({ resource: item, score }) => [item.id, score]);
    expect(chronological[0].resource.id).toBe("advanced");
    expect(reverseChronological.map(({ resource: item, score }) => [item.id, score])).toEqual(snapshot);
    expect(mixed.map(({ resource: item, score }) => [item.id, score])).toEqual(snapshot);
  });
});
