import { describe, expect, it } from "vitest";

import { getResourcesForLesson, learningResources } from "./catalog";

const expectedLessonResources = [
  ["ap-calculus-bc", "limits-and-continuity", "math-khan-limits-continuity-video"],
  ["ap-calculus-bc", "introduction-to-derivatives", "math-3b1b-derivative-geometry"],
  ["ap-calculus-bc", "basic-integration", "math-3b1b-integration-ftc"],
  ["ap-computer-science-a", "java-variables-and-data-types", "cs-freecodecamp-java-beginners-video"],
  ["ap-computer-science-a", "conditional-statements", "cs-freecodecamp-java-beginners-video"],
  ["ap-computer-science-a", "loops", "cs-freecodecamp-java-beginners-video"],
] as const;

describe("lesson resource mappings", () => {
  it.each(expectedLessonResources)(
    "maps %s/%s only to its reviewed video",
    (courseSlug, lessonSlug, resourceId) => {
      const resources = getResourcesForLesson(courseSlug, lessonSlug);
      expect(resources.map((resource) => resource.id)).toEqual([resourceId]);
      expect(resources[0].type).toBe("youtube-video");
      expect(resources[0].courseIds).toContain(courseSlug);
    },
  );

  it("does not infer mappings for lessons without an explicit reference", () => {
    expect(getResourcesForLesson("ap-calculus-bc", "not-a-real-lesson")).toEqual([]);
  });

  it("publishes only reviewed entries with attribution and verification dates", () => {
    expect(learningResources.length).toBeGreaterThanOrEqual(20);
    for (const resource of learningResources) {
      expect(resource.verified).toBe(true);
      expect(resource.attribution.length).toBeGreaterThan(8);
      expect(resource.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
