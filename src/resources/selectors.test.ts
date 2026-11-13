import { describe, expect, it } from "vitest";

import { filterAndSortResources } from "./selectors";
import type { LearningResource, ResourceFilters } from "./types";

const courseNames = {
  "ap-calculus-bc": "AP Calculus BC",
  "ap-computer-science-a": "AP Computer Science A",
};

function resource(overrides: Partial<LearningResource> & Pick<LearningResource, "id">): LearningResource {
  const { id, ...rest } = overrides;
  return {
    id,
    title: "General study guide",
    description: "A reviewed learning resource.",
    provider: "Example Education",
    creator: "Example Author",
    type: "documentation",
    subject: "English",
    difficulty: "beginner",
    access: "free-access",
    url: `https://developer.mozilla.org/${id}`,
    courseIds: [],
    topicIds: [],
    topicLabels: [],
    lessonRefs: [],
    attribution: "Example attribution",
    verified: true,
    lastVerifiedAt: "2026-11-12",
    addedAt: "2026-11-01",
    editorialOrder: 100,
    ...rest,
  };
}

function filters(overrides: Partial<ResourceFilters> = {}): ResourceFilters {
  return {
    query: "",
    type: "all",
    subject: "all",
    difficulty: "all",
    sort: "most-relevant",
    ...overrides,
  };
}

describe("resource search", () => {
  const resources = [
    resource({ id: "course", courseIds: ["ap-calculus-bc"] }),
    resource({ id: "topic", topicIds: ["matrix-theory"], topicLabels: ["Matrix theory"] }),
    resource({ id: "creator", creator: "Ada Lovelace" }),
    resource({ id: "provider", provider: "MIT OpenCourseWare" }),
  ];

  it.each([
    ["course name", "calculus bc", "course"],
    ["topic", "matrix theory", "topic"],
    ["creator", "ada lovelace", "creator"],
    ["provider", "mit opencourseware", "provider"],
  ])("finds a resource by %s", (_label, query, expectedId) => {
    const results = filterAndSortResources(resources, filters({ query }), courseNames);
    expect(results.map((item) => item.id)).toEqual([expectedId]);
  });
});

describe("resource filters", () => {
  const resources = [
    resource({
      id: "target",
      type: "textbook",
      subject: "Mathematics",
      difficulty: "advanced",
    }),
    resource({ id: "other-textbook", type: "textbook" }),
    resource({ id: "other-math", subject: "Mathematics" }),
    resource({ id: "other-advanced", difficulty: "advanced" }),
  ];

  it("filters independently by type, subject, difficulty, and saved state", () => {
    expect(filterAndSortResources(resources, filters({ type: "textbook" }), courseNames).map((item) => item.id)).toEqual([
      "other-textbook",
      "target",
    ]);
    expect(filterAndSortResources(resources, filters({ subject: "Mathematics" }), courseNames).map((item) => item.id)).toEqual([
      "other-math",
      "target",
    ]);
    expect(filterAndSortResources(resources, filters({ difficulty: "advanced" }), courseNames).map((item) => item.id)).toEqual([
      "other-advanced",
      "target",
    ]);
    expect(
      filterAndSortResources(
        resources,
        filters({ savedOnly: true }),
        courseNames,
        new Set(["target"]),
      ).map((item) => item.id),
    ).toEqual(["target"]);
  });
});

describe("resource sorting", () => {
  it("orders most-relevant results by field weight", () => {
    const resources = [
      resource({ id: "provider", provider: "Calculus Library", editorialOrder: 1 }),
      resource({ id: "topic", topicLabels: ["Calculus"], editorialOrder: 2 }),
      resource({ id: "contains", title: "Introduction to Calculus", editorialOrder: 3 }),
      resource({ id: "starts", title: "Calculus foundations", editorialOrder: 4 }),
      resource({ id: "exact", title: "Calculus", editorialOrder: 5 }),
    ];

    const results = filterAndSortResources(
      resources,
      filters({ query: "calculus", sort: "most-relevant" }),
      courseNames,
    );

    expect(results.map((item) => item.id)).toEqual([
      "exact",
      "starts",
      "contains",
      "topic",
      "provider",
    ]);
  });

  it("orders recently-added results by date, then editorial order", () => {
    const resources = [
      resource({ id: "older", addedAt: "2026-11-01", editorialOrder: 1 }),
      resource({ id: "newer-second", addedAt: "2026-11-12", editorialOrder: 2 }),
      resource({ id: "newer-first", addedAt: "2026-11-12", editorialOrder: 1 }),
    ];

    const results = filterAndSortResources(
      resources,
      filters({ sort: "recently-added" }),
      courseNames,
    );

    expect(results.map((item) => item.id)).toEqual(["newer-first", "newer-second", "older"]);
  });

  it("orders alphabetical results by title, then stable ID", () => {
    const resources = [
      resource({ id: "beta", title: "Beta" }),
      resource({ id: "alpha-b", title: "Alpha" }),
      resource({ id: "alpha-a", title: "Alpha" }),
    ];

    const results = filterAndSortResources(
      resources,
      filters({ sort: "alphabetical" }),
      courseNames,
    );

    expect(results.map((item) => item.id)).toEqual(["alpha-a", "alpha-b", "beta"]);
  });
});
