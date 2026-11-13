import type { LearningResource, ResourceFilters } from "./types";

export type CourseNamesById = Record<string, string>;

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize("NFKD");
}

function searchText(resource: LearningResource, courseNames: CourseNamesById) {
  return normalize(
    [
      resource.title,
      resource.description,
      resource.creator,
      resource.provider,
      resource.subject,
      ...resource.topicLabels,
      ...resource.courseIds.map((courseId) => courseNames[courseId] ?? courseId),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function relevanceScore(
  resource: LearningResource,
  query: string,
  courseNames: CourseNamesById,
) {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) {
    return (resource.featured ? 100 : 0) - resource.editorialOrder / 100;
  }

  let score = 0;
  const title = normalize(resource.title);
  const creator = normalize(resource.creator ?? "");
  const provider = normalize(resource.provider);
  const topics = normalize(resource.topicLabels.join(" "));
  const courseTitles = normalize(
    resource.courseIds.map((courseId) => courseNames[courseId] ?? courseId).join(" "),
  );

  if (title === normalizedQuery) score += 100;
  else if (title.startsWith(normalizedQuery)) score += 60;
  else if (title.includes(normalizedQuery)) score += 40;
  if (topics.includes(normalizedQuery)) score += 30;
  if (courseTitles.includes(normalizedQuery)) score += 25;
  if (creator.includes(normalizedQuery)) score += 20;
  if (provider.includes(normalizedQuery)) score += 15;
  if (resource.featured) score += 2;

  return score - resource.editorialOrder / 1000;
}

export function filterAndSortResources(
  resources: LearningResource[],
  filters: ResourceFilters,
  courseNames: CourseNamesById,
  savedIds: ReadonlySet<string> = new Set(),
) {
  const tokens = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);

  const filtered = resources.filter((resource) => {
    if (filters.type !== "all" && resource.type !== filters.type) return false;
    if (filters.subject !== "all" && resource.subject !== filters.subject) return false;
    if (filters.difficulty !== "all" && resource.difficulty !== filters.difficulty) return false;
    if (filters.savedOnly && !savedIds.has(resource.id)) return false;
    if (tokens.length > 0) {
      const haystack = searchText(resource, courseNames);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "alphabetical") {
      return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
    }
    if (filters.sort === "recently-added") {
      return b.addedAt.localeCompare(a.addedAt) || a.editorialOrder - b.editorialOrder;
    }
    return (
      relevanceScore(b, filters.query, courseNames) -
        relevanceScore(a, filters.query, courseNames) ||
      a.id.localeCompare(b.id)
    );
  });
}

export function getFeaturedResources(resources: LearningResource[], limit = 3) {
  return resources
    .filter((resource) => resource.featured)
    .sort((a, b) => a.editorialOrder - b.editorialOrder)
    .slice(0, limit);
}

export function getOpenResources(resources: LearningResource[], limit = 3) {
  return resources
    .filter((resource) => resource.access !== "free-access")
    .sort((a, b) => a.editorialOrder - b.editorialOrder)
    .slice(0, limit);
}
