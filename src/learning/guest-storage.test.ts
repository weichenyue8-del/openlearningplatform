import { beforeEach, describe, expect, it } from "vitest";

import {
  GUEST_LEARNING_STORAGE_KEY,
  isGuestEnrolled,
  isGuestLessonComplete,
  readGuestLearningStore,
  removeGuestEnrollment,
  setGuestLessonCompletion,
  touchGuestEnrollment,
} from "./guest-storage";

describe("guest learning storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("stores enrollment and composite lesson progress", () => {
    const now = new Date("2026-11-13T00:00:00.000Z");
    expect(touchGuestEnrollment("ap-calculus-bc", now).written).toBe(true);
    expect(setGuestLessonCompletion(
      "ap-calculus-bc",
      "limits-and-continuity",
      true,
      now,
    ).written).toBe(true);

    expect(isGuestEnrolled("ap-calculus-bc")).toBe(true);
    expect(isGuestLessonComplete("ap-calculus-bc", "limits-and-continuity")).toBe(true);
    expect(readGuestLearningStore().lessonProgress[0]?.lessonKey).toBe(
      "ap-calculus-bc/limits-and-continuity",
    );
  });

  it("keeps lesson history when a course is removed from the learning list", () => {
    setGuestLessonCompletion("ap-calculus-bc", "limits-and-continuity", true);
    expect(removeGuestEnrollment("ap-calculus-bc")).toBe(true);
    expect(isGuestEnrolled("ap-calculus-bc")).toBe(false);
    expect(isGuestLessonComplete("ap-calculus-bc", "limits-and-continuity")).toBe(true);
  });

  it("fails closed for malformed or future store versions", () => {
    window.localStorage.setItem(GUEST_LEARNING_STORAGE_KEY, "not-json");
    expect(readGuestLearningStore().enrollments).toEqual([]);
    window.localStorage.setItem(
      GUEST_LEARNING_STORAGE_KEY,
      JSON.stringify({ version: 2, enrollments: [], lessonProgress: [] }),
    );
    expect(readGuestLearningStore().lessonProgress).toEqual([]);
  });
});
