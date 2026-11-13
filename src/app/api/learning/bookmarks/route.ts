import { z } from "zod";

import {
  getResourceBookmarkIds,
  removeResourceBookmark,
  saveResourceBookmark,
} from "@/lib/database/learning";
import { getApiViewer, jsonResponse, readJsonRequest } from "@/lib/learning/api";

const bookmarkSchema = z.object({ resourceId: z.string().min(1).max(120) }).strict();

export async function GET() {
  const viewer = await getApiViewer();
  if (!viewer) return jsonResponse({ error: "Sign in to sync saved resources." }, { status: 401 });
  const result = await getResourceBookmarkIds(viewer.id);
  return jsonResponse(result.ok ? { resourceIds: result.data } : { error: result.error }, { status: result.ok ? 200 : 400 });
}

async function mutate(request: Request, save: boolean) {
  const viewer = await getApiViewer();
  if (!viewer) return jsonResponse({ error: "Sign in to sync saved resources." }, { status: 401 });
  const body = await readJsonRequest(request);
  if (!body.ok) return body.response;
  const parsed = bookmarkSchema.safeParse(body.value);
  if (!parsed.success) return jsonResponse({ error: "A valid resource is required." }, { status: 400 });
  const result = save
    ? await saveResourceBookmark(viewer.id, parsed.data.resourceId)
    : await removeResourceBookmark(viewer.id, parsed.data.resourceId);
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}

export function POST(request: Request) {
  return mutate(request, true);
}

export function DELETE(request: Request) {
  return mutate(request, false);
}
