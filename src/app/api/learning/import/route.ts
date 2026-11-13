import { importGuestLearning } from "@/lib/database/guest-import";
import { guestLearningImportSchema } from "@/lib/learning/guest-import";
import { getApiViewer, jsonResponse, readJsonRequest } from "@/lib/learning/api";

export async function POST(request: Request) {
  const viewer = await getApiViewer();
  if (!viewer) return jsonResponse({ error: "Sign in before importing browser progress." }, { status: 401 });
  const body = await readJsonRequest(request, 131_072);
  if (!body.ok) return body.response;
  const parsed = guestLearningImportSchema.safeParse(body.value);
  if (!parsed.success) {
    return jsonResponse({ error: "The browser progress snapshot is not valid." }, { status: 400 });
  }
  const result = await importGuestLearning(viewer.id, parsed.data);
  return jsonResponse(result.ok ? result.data : { error: result.error }, { status: result.ok ? 200 : 400 });
}
