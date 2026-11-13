import { describe, expect, it } from "vitest";

import { learningResources } from "./catalog";
import type { LearningResource } from "./types";
import {
  allowedResourceHosts,
  assertValidResourceCatalog,
  canonicalResourceKey,
  extractYouTubeVideoId,
  getCatalogValidationErrors,
  validateResourceUrl,
} from "./validation";

describe("resource URL validation", () => {
  it("accepts every reviewed host and rejects lookalike hosts", () => {
    for (const host of allowedResourceHosts) {
      expect(validateResourceUrl(`https://${host}/`).valid).toBe(true);
    }

    expect(validateResourceUrl("https://www.youtube.com.evil.example/watch?v=WUvTyaaNkzM").valid).toBe(false);
    expect(validateResourceUrl("https://evil-youtube.com/watch?v=WUvTyaaNkzM").valid).toBe(false);
  });

  it("requires HTTPS and rejects credentials and custom ports", () => {
    expect(validateResourceUrl("http://github.com/openai/openai-node").valid).toBe(false);
    expect(validateResourceUrl("https://user:secret@github.com/openai/openai-node").valid).toBe(false);
    expect(validateResourceUrl("https://github.com:8443/openai/openai-node").valid).toBe(false);
    expect(validateResourceUrl("https://github.com:443/openai/openai-node").valid).toBe(true);
  });

  it("extracts only valid YouTube IDs from supported URL forms", () => {
    const videoId = "WUvTyaaNkzM";

    expect(extractYouTubeVideoId(`https://www.youtube.com/watch?v=${videoId}`)).toBe(videoId);
    expect(extractYouTubeVideoId(`https://youtu.be/${videoId}`)).toBe(videoId);
    expect(extractYouTubeVideoId(`https://m.youtube.com/shorts/${videoId}`)).toBe(videoId);
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=too-short")).toBeUndefined();
    expect(extractYouTubeVideoId(`https://github.com/watch?v=${videoId}`)).toBeUndefined();
  });

  it("canonicalizes equivalent URLs for deterministic deduplication", () => {
    const videoId = "WUvTyaaNkzM";
    expect(canonicalResourceKey(`https://www.youtube.com/watch?v=${videoId}`)).toBe(`youtube:${videoId}`);
    expect(canonicalResourceKey(`https://youtu.be/${videoId}`)).toBe(`youtube:${videoId}`);
    expect(canonicalResourceKey(`https://www.youtube.com/shorts/${videoId}`)).toBe(`youtube:${videoId}`);

    expect(canonicalResourceKey("https://github.com/openai/openai-node/?b=2&a=1")).toBe(
      canonicalResourceKey("https://github.com/openai/openai-node?a=1&b=2"),
    );
  });
});

describe("resource catalog validation", () => {
  it("accepts the published catalog", () => {
    expect(getCatalogValidationErrors(learningResources)).toEqual([]);
    expect(() => assertValidResourceCatalog(learningResources)).not.toThrow();
  });

  it("reports canonical duplicates and mismatched YouTube IDs", () => {
    const original = learningResources.find(
      (resource) => resource.id === "math-3b1b-calculus-essence",
    )!;
    const duplicate: LearningResource = {
      ...original,
      id: "duplicate-video",
      url: "https://youtu.be/WUvTyaaNkzM",
      youtubeVideoId: "differentId",
    };

    const errors = getCatalogValidationErrors([original, duplicate]);

    expect(errors).toContain(`Resource duplicate-video: duplicates ${original.id}`);
    expect(errors).toContain("Resource duplicate-video: YouTube URL and video id do not match");
  });
});
