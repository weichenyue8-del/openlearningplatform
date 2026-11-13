import { describe, expect, it } from "vitest";

import {
  courses,
  getAdjacentLessons,
  getCourseBySlug,
  getCourseLessonCount,
  getLesson,
  isCourseAvailable,
} from "./course-catalog";

describe("course catalog", () => {
  it("contains the nine requested AP courses without fabricated availability", () => {
    expect(courses).toHaveLength(9);
    expect(courses.filter(isCourseAvailable).map((course) => course.slug)).toEqual([
      "ap-calculus-bc",
      "ap-computer-science-a",
    ]);
  });

  it("publishes three real lessons for each available example course", () => {
    expect(getCourseLessonCount(getCourseBySlug("ap-calculus-bc")!)).toBe(3);
    expect(getCourseLessonCount(getCourseBySlug("ap-computer-science-a")!)).toBe(3);
  });

  it("finds lessons from the central catalog", () => {
    const course = getCourseBySlug("ap-calculus-bc")!;
    expect(getLesson(course, "limits-and-continuity")?.title).toBe("Limits and Continuity");
    expect(getLesson(course, "not-a-real-lesson")).toBeUndefined();
  });

  it("returns correct previous and next lesson navigation", () => {
    const course = getCourseBySlug("ap-calculus-bc")!;
    const first = getAdjacentLessons(course, "limits-and-continuity");
    const middle = getAdjacentLessons(course, "introduction-to-derivatives");
    const last = getAdjacentLessons(course, "basic-integration");

    expect(first.previous).toBeUndefined();
    expect(first.next?.slug).toBe("introduction-to-derivatives");
    expect(middle.previous?.slug).toBe("limits-and-continuity");
    expect(middle.next?.slug).toBe("basic-integration");
    expect(last.previous?.slug).toBe("introduction-to-derivatives");
    expect(last.next).toBeUndefined();
  });
});
