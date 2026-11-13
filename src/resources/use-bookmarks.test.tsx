import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { readResourceBookmarks, writeResourceBookmarks } from "./storage";
import { useResourceBookmarks } from "./use-bookmarks";

describe("useResourceBookmarks", () => {
  beforeEach(() => window.localStorage.clear());

  it("does not remove bookmarks belonging to another resource view", () => {
    writeResourceBookmarks([
      { resourceId: "saved-elsewhere", savedAt: "2026-11-12T00:00:00.000Z" },
    ]);

    const { result } = renderHook(() => useResourceBookmarks(["lesson-resource"]));

    act(() => {
      expect(result.current.toggle("lesson-resource")).toBe(true);
    });

    expect(readResourceBookmarks().map((item) => item.resourceId)).toEqual([
      "lesson-resource",
      "saved-elsewhere",
    ]);
  });

  it("refuses to toggle an ID outside the current view", () => {
    const { result } = renderHook(() => useResourceBookmarks(["allowed"]));

    act(() => {
      expect(result.current.toggle("not-rendered")).toBe(false);
    });

    expect(readResourceBookmarks()).toEqual([]);
  });
});
