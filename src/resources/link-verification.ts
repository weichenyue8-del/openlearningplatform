import type { LearningResource } from "./types";
import { validateResourceUrl } from "./validation";

export type ResourceAvailabilityResult = {
  resourceId: string;
  checkedAt: string;
  available: boolean;
  status?: number;
  finalUrl?: string;
  embedAvailable?: boolean;
  error?: string;
};

async function requestAvailability(
  url: string,
  request: typeof fetch,
  signal: AbortSignal,
) {
  let response = await request(url, { method: "HEAD", redirect: "follow", signal });
  if (response.status === 403 || response.status === 405) {
    response = await request(url, {
      method: "GET",
      redirect: "follow",
      signal,
      headers: { Range: "bytes=0-0" },
    });
  }
  return response;
}

/**
 * Maintainer-facing availability check. It never changes the catalog or marks a
 * source verified automatically; reviewers still inspect ownership, metadata,
 * quality, licensing, and actual playback.
 */
export async function verifyResourceAvailability(
  resource: LearningResource,
  request: typeof fetch = fetch,
  timeoutMs = 12_000,
): Promise<ResourceAvailabilityResult> {
  const checkedAt = new Date().toISOString();
  const urlCheck = validateResourceUrl(resource.url);
  if (!urlCheck.valid) {
    return { resourceId: resource.id, checkedAt, available: false, error: urlCheck.reason };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await requestAvailability(resource.url, request, controller.signal);
    const available = response.status >= 200 && response.status < 400;
    let embedAvailable: boolean | undefined;

    if (resource.type === "youtube-video" && resource.youtubeVideoId) {
      const id = encodeURIComponent(resource.youtubeVideoId);
      const [oEmbed, privacyEmbed] = await Promise.all([
        request(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
          { method: "GET", redirect: "follow", signal: controller.signal },
        ),
        request(`https://www.youtube-nocookie.com/embed/${id}`, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
        }),
      ]);
      embedAvailable = oEmbed.ok && privacyEmbed.ok;
    }

    return {
      resourceId: resource.id,
      checkedAt,
      available,
      status: response.status,
      finalUrl: response.url,
      embedAvailable,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown availability error";
    return { resourceId: resource.id, checkedAt, available: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyCatalogAvailability(
  resources: LearningResource[],
  request: typeof fetch = fetch,
  concurrency = 4,
) {
  const results: ResourceAvailabilityResult[] = [];
  for (let index = 0; index < resources.length; index += concurrency) {
    const batch = resources.slice(index, index + concurrency);
    results.push(...await Promise.all(
      batch.map((resource) => verifyResourceAvailability(resource, request)),
    ));
  }
  return results;
}
