import { describe, expect, it } from "vitest";

import {
  getKnownLesson,
  makeLessonKey,
  parseLessonKey,
} from "./identifiers";

describe("learning identifiers", () => {
  it("uses the course and lesson together as the stable lesson key", () => {
    expect(makeLessonKey("ap-calculus-bc", "limits-and-continuity")).toBe(
      "ap-calculus-bc/limits-and-continuity",
    );
    expect(parseLessonKey("ap-calculus-bc/limits-and-continuity")).toMatchObject({
      courseId: "ap-calculus-bc",
      lessonId: "limits-and-continuity",
    });
  });

  it("rejects unknown, bare, and malformed lesson keys", () => {
    expect(parseLessonKey("limits-and-continuity")).toBeUndefined();
    expect(parseLessonKey("ap-calculus-bc/not-real")).toBeUndefined();
    expect(parseLessonKey("ap-calculus-bc/limits-and-continuity/extra")).toBeUndefined();
    expect(getKnownLesson("not-real", "limits-and-continuity")).toBeUndefined();
  });
});
