import type { MetadataRoute } from "next";

import { courses, getCourseLessons } from "@/content/course-catalog";
import { getSiteUrl } from "@/lib/supabase/config";

const publicRoutes = [
  "",
  "/about",
  "/contact",
  "/contribute",
  "/courses",
  "/practice",
  "/privacy",
  "/resources",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const courseRoutes = courses.flatMap((course) => [
    `/courses/${course.slug}`,
    `/practice/${course.slug}`,
    ...getCourseLessons(course).map(
      (lesson) => `/courses/${course.slug}/${lesson.slug}`,
    ),
  ]);

  return [...publicRoutes, ...courseRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/courses" ? 0.9 : 0.7,
  }));
}
