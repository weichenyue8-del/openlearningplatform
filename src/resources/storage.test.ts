import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  readResourceBookmarks,
  RESOURCE_BOOKMARK_EVENT,
  RESOURCE_BOOKMARK_STORAGE_KEY,
  toggleResourceBookmark,
  writeResourceBookmarks,
} from "./storage";
import type { ResourceBookmark } from "./storage";

const SAVED_AT = "2026-11-12T00:00:00.000Z";

function bookmark(resourceId: string, savedAt = SAVED_AT): ResourceBookmark {
  return { resourceId, savedAt };
}

describe("resource bookmark storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("fails closed for corrupt, unsupported, or malformed versioned data", () => {
    const invalidPayloads = [
      "not-json",
      JSON.stringify({ version: 2, items: [] }),
      JSON.stringify({ version: 1, items: [{ resourceId: "resource", savedAt: "not-a-date" }] }),
    ];

    for (const payload of invalidPayloads) {
      window.localStorage.setItem(RESOURCE_BOOKMARK_STORAGE_KEY, payload);
      expect(readResourceBookmarks()).toEqual([]);
    }
  });

  it("prunes stale and duplicate IDs while preserving order and the 200-item cap", () => {
    const validResourceIds = Array.from({ length: 205 }, (_, index) => `valid-${index}`);
    const validIds = new Set(["keep", ...validResourceIds]);
    const items = [
      bookmark("keep"),
      bookmark("keep", "2026-11-12T00:01:00.000Z"),
      bookmark("removed-from-catalog"),
      ...validResourceIds.map((resourceId) => bookmark(resourceId)),
    ];

    window.localStorage.setItem(
      RESOURCE_BOOKMARK_STORAGE_KEY,
      JSON.stringify({ version: 1, items }),
    );

    const bookmarks = readResourceBookmarks(validIds);

    expect(bookmarks).toHaveLength(200);
    expect(bookmarks.map(({ resourceId }) => resourceId)).toEqual([
      "keep",
      ...validResourceIds.slice(0, 199),
    ]);
  });

  it("writes the current version and persists both sides of a toggle", () => {
    const changed = vi.fn();
    window.addEventListener(RESOURCE_BOOKMARK_EVENT, changed);
    const validIds = new Set(["resource-a"]);
    const now = new Date(SAVED_AT);

    const added = toggleResourceBookmark("resource-a", validIds, now);

    expect(added).toEqual({
      saved: true,
      written: true,
      items: [bookmark("resource-a")],
    });
    expect(readResourceBookmarks(validIds)).toEqual([bookmark("resource-a")]);
    expect(JSON.parse(window.localStorage.getItem(RESOURCE_BOOKMARK_STORAGE_KEY) ?? "null"))
      .toEqual({ version: 1, items: [bookmark("resource-a")] });

    const removed = toggleResourceBookmark("resource-a", validIds, now);

    expect(removed).toEqual({ saved: false, written: true, items: [] });
    expect(readResourceBookmarks(validIds)).toEqual([]);
    expect(changed).toHaveBeenCalledTimes(2);
    window.removeEventListener(RESOURCE_BOOKMARK_EVENT, changed);
  });

  it("normalizes duplicate bookmarks when writing directly", () => {
    expect(writeResourceBookmarks([
      bookmark("resource-a"),
      bookmark("resource-a", "2026-11-12T00:01:00.000Z"),
      bookmark("resource-b"),
    ])).toBe(true);

    expect(readResourceBookmarks()).toEqual([
      bookmark("resource-a"),
      bookmark("resource-b"),
    ]);
  });
});
