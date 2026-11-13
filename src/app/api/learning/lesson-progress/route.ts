import { z } from "zod";

import {
  getLessonCompletionState,
  setLessonCompletion,
} from "@/lib/database/learning";
import { getApiViewer, jsonResponse, readJsonRequest } from "@/lib/learning/api";

const lessonSchema = z.object({
  courseId: z.string().min(1).max(80),
  lessonId: z.string().min(1).max(80),
  completed: z.boolean().optional(),
}).strict();

export async function GET(request: Request) {
  const viewer = await getApiViewer();
  if (!viewer) return jsonResponse({ error: "Sign in to sync lesson progress." }, { status: 401 });
  const url = new URL(request.url);
  const parsed = lessonSchema.safeParse({
    courseId: url.searchParams.get("courseId"),
    lessonId: url.searchParams.get("lessonId"),
  });
  if (!parsed.success) return jsonResponse({ error: "A valid lesson is required." }, { status: 400 });
  const result = await getLessonCompletionState(viewer.id, parsed.data.courseId, parsed.data.lessonId);
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}

export async function POST(request: Request) {
  const viewer = await getApiViewer();
  if (!viewer) return jsonResponse({ error: "Sign in to sync lesson progress." }, { status: 401 });
  const body = await readJsonRequest(request);
  if (!body.ok) return body.response;
  const parsed = lessonSchema.required({ completed: true }).safeParse(body.value);
  if (!parsed.success) return jsonResponse({ error: "A valid lesson update is required." }, { status: 400 });
  const result = await setLessonCompletion(
    viewer.id,
    parsed.data.courseId,
    parsed.data.lessonId,
    parsed.data.completed,
  );
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}
