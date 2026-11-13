import { beforeEach, describe, expect, it } from "vitest";

import {
  createSafeSessionId,
  getPracticeSession,
  PRACTICE_STORAGE_KEY,
  readPracticeSessions,
  sanitizeReturnPath,
  upsertPracticeSession,
} from "./storage";
import type { PracticeSession } from "./types";

function session(id: string): PracticeSession {
  return {
    version: 1,
    id,
    courseId: "course",
    courseTitle: "Course",
    questionIds: ["q1"],
    filters: {},
    attempts: [],
    startedAt: "2026-11-12T00:00:00.000Z",
    updatedAt: "2026-11-12T00:00:00.000Z",
  };
}

describe("browser practice history", () => {
  beforeEach(() => window.localStorage.clear());

  it("stores and retrieves versioned anonymous sessions", () => {
    expect(upsertPracticeSession(session("session-123"))).toBe(true);
    expect(getPracticeSession("session-123")?.courseTitle).toBe("Course");
  });

  it("fails closed when stored JSON is corrupt or does not match the schema", () => {
    window.localStorage.setItem(PRACTICE_STORAGE_KEY, "not-json");
    expect(readPracticeSessions()).toEqual([]);
    window.localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify([{ version: 99 }]));
    expect(readPracticeSessions()).toEqual([]);
  });

  it("creates cryptographically sourced identifiers", () => {
    expect(createSafeSessionId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("allows only known internal return destinations", () => {
    expect(sanitizeReturnPath("/courses/ap-calculus-bc/limits-and-continuity")).toBe("/courses/ap-calculus-bc/limits-and-continuity");
    expect(sanitizeReturnPath("/practice/results/local-id")).toBe("/practice/results/local-id");
    expect(sanitizeReturnPath("//evil.example/path")).toBeUndefined();
    expect(sanitizeReturnPath("https://evil.example/path")).toBeUndefined();
  });
});
