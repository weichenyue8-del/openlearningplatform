import { courses } from "@/content/course-catalog";

import type { LearningResource } from "./types";

export const allowedResourceHosts = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "ocw.mit.edu",
  "cs50.harvard.edu",
  "learn.mru.org",
  "www.khanacademy.org",
  "dev.java",
  "docs.python.org",
  "developer.mozilla.org",
  "owl.purdue.edu",
  "openstax.org",
  "help.openstax.org",
  "github.com",
]);

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export type ResourceUrlValidation =
  | { valid: true; url: URL }
  | { valid: false; reason: string };

export function validateResourceUrl(value: string): ResourceUrlValidation {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { valid: false, reason: "URL is not structurally valid" };
  }

  if (url.protocol !== "https:") {
    return { valid: false, reason: "Only HTTPS resource URLs are supported" };
  }
  if (url.username || url.password) {
    return { valid: false, reason: "Resource URLs cannot contain credentials" };
  }
  if (url.port && url.port !== "443") {
    return { valid: false, reason: "Resource URLs cannot use a custom port" };
  }
  if (!allowedResourceHosts.has(url.hostname.toLowerCase())) {
    return { valid: false, reason: `Unsupported resource host: ${url.hostname}` };
  }
  if (url.hash) {
    return { valid: false, reason: "Resource URLs cannot contain fragments" };
  }

  return { valid: true, url };
}

export function extractYouTubeVideoId(value: string): string | undefined {
  const result = validateResourceUrl(value);
  if (!result.valid) return undefined;

  const { url } = result;
  const host = url.hostname.toLowerCase();
  let id: string | null | undefined;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0];
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2];
  }

  return id && youtubeIdPattern.test(id) ? id : undefined;
}

export function canonicalResourceKey(value: string) {
  const youtubeId = extractYouTubeVideoId(value);
  if (youtubeId) return `youtube:${youtubeId}`;

  const result = validateResourceUrl(value);
  if (!result.valid) return undefined;
  const url = result.url;
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";
  const search = [...url.searchParams.entries()]
    .sort(([aKey, aValue], [bKey, bValue]) =>
      aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
    )
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `${url.hostname.toLowerCase()}${pathname}${search ? `?${search}` : ""}`;
}

function findCourse(courseSlug: string) {
  return courses.find((course) => course.slug === courseSlug);
}

export function getCatalogValidationErrors(resources: LearningResource[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const canonicalUrls = new Map<string, string>();

  for (const resource of resources) {
    const prefix = `Resource ${resource.id || "(missing id)"}`;
    if (!resource.id.trim()) errors.push(`${prefix}: id is required`);
    if (ids.has(resource.id)) errors.push(`${prefix}: duplicate id`);
    ids.add(resource.id);

    if (!resource.title.trim() || !resource.description.trim() || !resource.provider.trim()) {
      errors.push(`${prefix}: title, description, and provider are required`);
    }
    if (!resource.verified) errors.push(`${prefix}: unverified entries cannot be published`);
    if (!datePattern.test(resource.lastVerifiedAt) || !datePattern.test(resource.addedAt)) {
      errors.push(`${prefix}: verification and added dates must use YYYY-MM-DD`);
    }

    const urlResult = validateResourceUrl(resource.url);
    if (!urlResult.valid) errors.push(`${prefix}: ${urlResult.reason}`);
    const key = canonicalResourceKey(resource.url);
    if (key) {
      const duplicate = canonicalUrls.get(key);
      if (duplicate) errors.push(`${prefix}: duplicates ${duplicate}`);
      else canonicalUrls.set(key, resource.id);
    }

    if (resource.type === "youtube-video") {
      const parsedId = extractYouTubeVideoId(resource.url);
      if (!resource.youtubeVideoId || parsedId !== resource.youtubeVideoId) {
        errors.push(`${prefix}: YouTube URL and video id do not match`);
      }
      if (!resource.embedStatus) errors.push(`${prefix}: video embed status is required`);
    } else if (resource.youtubeVideoId || resource.embedStatus) {
      errors.push(`${prefix}: only YouTube videos may define embed metadata`);
    }

    if (resource.access !== "free-access" && (!resource.license || !resource.licenseUrl)) {
      errors.push(`${prefix}: open resources require verified license metadata`);
    }
    if (resource.licenseUrl) {
      const licenseResult = validateResourceUrl(resource.licenseUrl);
      if (!licenseResult.valid) errors.push(`${prefix}: invalid license URL (${licenseResult.reason})`);
    }

    for (const courseId of resource.courseIds) {
      if (!findCourse(courseId)) errors.push(`${prefix}: unknown course ${courseId}`);
    }
    for (const ref of resource.lessonRefs) {
      const course = findCourse(ref.courseSlug);
      const lesson = course?.units.flatMap((unit) => unit.lessons).find((item) => item.slug === ref.lessonSlug);
      if (!lesson) errors.push(`${prefix}: unknown lesson ${ref.courseSlug}/${ref.lessonSlug}`);
      if (!resource.courseIds.includes(ref.courseSlug)) {
        errors.push(`${prefix}: lesson course ${ref.courseSlug} is missing from courseIds`);
      }
    }
    if (resource.topicIds.length !== resource.topicLabels.length) {
      errors.push(`${prefix}: topic ids and labels must have the same length`);
    }
  }

  return errors;
}

export function assertValidResourceCatalog(resources: LearningResource[]) {
  const errors = getCatalogValidationErrors(resources);
  if (errors.length > 0) {
    throw new Error(`Invalid learning resource catalog:\n${errors.join("\n")}`);
  }
}
