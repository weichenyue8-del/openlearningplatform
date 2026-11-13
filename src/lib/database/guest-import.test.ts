import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  bookmarkUpsert: vi.fn(),
  courseUpsert: vi.fn(),
  createClient: vi.fn(),
  lessonUpsert: vi.fn(),
  ownsRequestedUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("./authorization", () => ({
  ownsRequestedUser: mocks.ownsRequestedUser,
  unauthorizedDataResult: { ok: false, error: "You are not authorized to access that data." },
}));

import { importGuestLearning } from "./guest-import";

describe("guest-to-account learning merge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ownsRequestedUser.mockResolvedValue(true);
    mocks.courseUpsert.mockResolvedValue({ error: null });
    mocks.lessonUpsert.mockResolvedValue({ error: null });
    mocks.bookmarkUpsert.mockResolvedValue({ error: null });

    const tables = {
      course_enrollments: {
        select: () => ({
          eq: async () => ({
            data: [{
              course_id: "ap-calculus-bc",
              enrolled_at: "2026-11-10T00:00:00.000Z",
              last_accessed_at: "2026-11-13T01:00:00.000Z",
            }],
            error: null,
          }),
        }),
        upsert: mocks.courseUpsert,
      },
      lesson_progress: {
        select: () => ({
          eq: async () => ({
            data: [{
              course_id: "ap-calculus-bc",
              lesson_id: "limits-and-continuity",
              updated_at: "2026-11-13T01:00:00.000Z",
            }],
            error: null,
          }),
        }),
        upsert: mocks.lessonUpsert,
      },
      resource_bookmarks: { upsert: mocks.bookmarkUpsert },
    };

    mocks.createClient.mockResolvedValue({
      from: (table: keyof typeof tables) => tables[table],
      rpc: vi.fn(),
    });
  });

  it("keeps newer cloud progress and deduplicates imported bookmarks", async () => {
    const result = await importGuestLearning("user-a", {
      version: 1,
      enrollments: [{
        courseId: "ap-calculus-bc",
        enrolledAt: "2026-11-12T00:00:00.000Z",
        lastAccessedAt: "2026-11-12T01:00:00.000Z",
      }],
      lessonProgress: [{
        lessonKey: "ap-calculus-bc/limits-and-continuity",
        completed: false,
        updatedAt: "2026-11-12T02:00:00.000Z",
      }],
      bookmarks: [
        { resourceId: "math-3b1b-calculus-essence", savedAt: "2026-11-12T03:00:00.000Z" },
        { resourceId: "math-3b1b-calculus-essence", savedAt: "2026-11-12T04:00:00.000Z" },
      ],
      practiceSessions: [],
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        imported: { enrollments: 1, lessonProgress: 0, bookmarks: 1 },
        skipped: { lessonProgress: 1, bookmarks: 1 },
      },
    });
    expect(mocks.lessonUpsert).not.toHaveBeenCalled();
    expect(mocks.courseUpsert).toHaveBeenCalledWith([
      expect.objectContaining({
        enrolled_at: "2026-11-10T00:00:00.000Z",
        last_accessed_at: "2026-11-13T01:00:00.000Z",
      }),
    ], { onConflict: "user_id,course_id" });
    expect(mocks.bookmarkUpsert).toHaveBeenCalledWith([
      expect.objectContaining({ resource_id: "math-3b1b-calculus-essence" }),
    ], {
      ignoreDuplicates: true,
      onConflict: "user_id,resource_id",
    });
  });
});
