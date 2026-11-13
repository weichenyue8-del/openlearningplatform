import { afterEach, describe, expect, it, vi } from "vitest";

import { courses, getCourseLessons } from "@/content/course-catalog";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public metadata routes", () => {
  it("keeps private and account routes out of search results", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://openap.example");

    expect(robots()).toEqual({
      rules: expect.objectContaining({
        userAgent: "*",
        allow: "/",
        disallow: expect.arrayContaining(["/api/", "/dashboard", "/practice/results/"]),
      }),
      sitemap: "https://openap.example/sitemap.xml",
      host: "https://openap.example",
    });
  });

  it("publishes every course and reviewed lesson in the sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://openap.example");

    const urls = sitemap().map((entry) => entry.url);
    const lessonCount = courses.reduce(
      (total, course) => total + getCourseLessons(course).length,
      0,
    );

    expect(urls).toContain("https://openap.example/courses");
    expect(urls).toContain("https://openap.example/courses/ap-calculus-bc/limits-and-continuity");
    expect(urls).toContain("https://openap.example/practice/ap-computer-science-a");
    expect(urls).toHaveLength(9 + courses.length * 2 + lessonCount);
  });
});
