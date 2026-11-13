import { z } from "zod";

export const RESOURCE_BOOKMARK_STORAGE_KEY = "openap.resources.bookmarks.v1";
export const RESOURCE_BOOKMARK_EVENT = "openap:resource-bookmarks-changed";
const MAX_BOOKMARKS = 200;

const bookmarkStoreSchema = z.object({
  version: z.literal(1),
  items: z.array(
    z.object({
      resourceId: z.string().min(1),
      savedAt: z.string().datetime(),
    }),
  ),
});

export type ResourceBookmark = z.infer<typeof bookmarkStoreSchema>["items"][number];

function storageAvailable() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function normalizeBookmarks(
  items: ResourceBookmark[],
  validIds?: ReadonlySet<string>,
) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.resourceId)) return false;
    if (validIds && !validIds.has(item.resourceId)) return false;
    seen.add(item.resourceId);
    return true;
  }).slice(0, MAX_BOOKMARKS);
}

export function readResourceBookmarks(validIds?: ReadonlySet<string>): ResourceBookmark[] {
  if (!storageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(RESOURCE_BOOKMARK_STORAGE_KEY);
    if (!raw) return [];
    return parseResourceBookmarks(raw, validIds);
  } catch {
    return [];
  }
}

export function parseResourceBookmarks(
  raw: string,
  validIds?: ReadonlySet<string>,
): ResourceBookmark[] {
  try {
    const parsed = bookmarkStoreSchema.safeParse(JSON.parse(raw));
    return parsed.success ? normalizeBookmarks(parsed.data.items, validIds) : [];
  } catch {
    return [];
  }
}

export function writeResourceBookmarks(items: ResourceBookmark[]) {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(
      RESOURCE_BOOKMARK_STORAGE_KEY,
      JSON.stringify({ version: 1, items: normalizeBookmarks(items) }),
    );
    window.dispatchEvent(new Event(RESOURCE_BOOKMARK_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function toggleResourceBookmark(
  resourceId: string,
  validIds?: ReadonlySet<string>,
  now = new Date(),
) {
  const bookmarks = readResourceBookmarks(validIds);
  const isSaved = bookmarks.some((item) => item.resourceId === resourceId);
  const next = isSaved
    ? bookmarks.filter((item) => item.resourceId !== resourceId)
    : [{ resourceId, savedAt: now.toISOString() }, ...bookmarks];
  const normalized = normalizeBookmarks(next, validIds);
  return { saved: !isSaved, written: writeResourceBookmarks(normalized), items: normalized };
}
