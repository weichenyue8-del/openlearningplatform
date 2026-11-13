export const resourceTypes = [
  "youtube-video",
  "online-course",
  "textbook",
  "documentation",
  "github-repository",
] as const;

export const resourceSubjects = [
  "Mathematics",
  "Computer Science",
  "Economics",
  "Physics",
  "Science",
  "English",
] as const;

export const resourceDifficulties = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const resourceAccessKinds = [
  "free-access",
  "open-licensed",
  "open-source",
] as const;

export const resourceSortOptions = [
  "most-relevant",
  "recently-added",
  "alphabetical",
] as const;

export type ResourceType = (typeof resourceTypes)[number];
export type ResourceSubject = (typeof resourceSubjects)[number];
export type ResourceDifficulty = (typeof resourceDifficulties)[number];
export type ResourceAccessKind = (typeof resourceAccessKinds)[number];
export type ResourceSort = (typeof resourceSortOptions)[number];

export type LessonResourceRef = {
  courseSlug: string;
  lessonSlug: string;
};

/**
 * Reviewed public catalog entry. Unreviewed submissions never use this shape in
 * the public UI; they must pass the contribution review and catalog validation.
 */
export type LearningResource = {
  id: string;
  title: string;
  description: string;
  provider: string;
  creator?: string;
  type: ResourceType;
  subject: ResourceSubject;
  difficulty: ResourceDifficulty;
  access: ResourceAccessKind;
  url: string;
  courseIds: string[];
  topicIds: string[];
  topicLabels: string[];
  lessonRefs: LessonResourceRef[];
  youtubeVideoId?: string;
  embedStatus?: "verified" | "link-only";
  license?: string;
  licenseUrl?: string;
  licenseNote?: string;
  attribution: string;
  verified: true;
  lastVerifiedAt: string;
  addedAt: string;
  featured?: boolean;
  editorialOrder: number;
};

export type ResourceFilters = {
  query: string;
  type: ResourceType | "all";
  subject: ResourceSubject | "all";
  difficulty: ResourceDifficulty | "all";
  sort: ResourceSort;
  savedOnly?: boolean;
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  "youtube-video": "Video",
  "online-course": "Online Course",
  textbook: "Textbook",
  documentation: "Documentation",
  "github-repository": "GitHub Repository",
};

export const resourceAccessLabels: Record<ResourceAccessKind, string> = {
  "free-access": "Free to access",
  "open-licensed": "Openly licensed",
  "open-source": "Open-source repository",
};
