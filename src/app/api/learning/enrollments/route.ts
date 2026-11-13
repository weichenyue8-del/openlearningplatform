import { z } from "zod";

import {
  enrollInCourse,
  getEnrollmentState,
  leaveCourse,
} from "@/lib/database/learning";
import { getApiViewer, jsonResponse, readJsonRequest } from "@/lib/learning/api";

const courseSchema = z.object({ courseId: z.string().min(1).max(80) }).strict();

async function viewerOrResponse() {
  const viewer = await getApiViewer();
  return viewer ?? jsonResponse({ error: "Sign in to sync course progress." }, { status: 401 });
}

export async function GET(request: Request) {
  const viewer = await viewerOrResponse();
  if (viewer instanceof Response) return viewer;
  const parsed = courseSchema.safeParse({ courseId: new URL(request.url).searchParams.get("courseId") });
  if (!parsed.success) return jsonResponse({ error: "A valid course is required." }, { status: 400 });
  const result = await getEnrollmentState(viewer.id, parsed.data.courseId);
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}

async function mutate(request: Request, action: "enroll" | "leave") {
  const viewer = await viewerOrResponse();
  if (viewer instanceof Response) return viewer;
  const body = await readJsonRequest(request);
  if (!body.ok) return body.response;
  const parsed = courseSchema.safeParse(body.value);
  if (!parsed.success) return jsonResponse({ error: "A valid course is required." }, { status: 400 });
  const result = action === "enroll"
    ? await enrollInCourse(viewer.id, parsed.data.courseId)
    : await leaveCourse(viewer.id, parsed.data.courseId);
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}

export function POST(request: Request) {
  return mutate(request, "enroll");
}

export function DELETE(request: Request) {
  return mutate(request, "leave");
}
