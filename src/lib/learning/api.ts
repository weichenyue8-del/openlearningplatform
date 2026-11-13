import "server-only";

import { getOptionalViewer } from "@/lib/auth/session";

export const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", noStoreHeaders["Cache-Control"]);
  return Response.json(body, { ...init, headers });
}

export async function getApiViewer() {
  return getOptionalViewer();
}

async function readTextWithinLimit(request: Request, maxBytes: number) {
  if (!request.body) return { ok: true as const, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false as const, tooLarge: true as const };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false as const, tooLarge: false as const };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true as const, text: new TextDecoder().decode(bytes) };
}

export async function readJsonRequest(request: Request, maxBytes = 16_384) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false as const,
      response: jsonResponse({ error: "JSON is required." }, { status: 415 }),
    };
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return {
      ok: false as const,
      response: jsonResponse({ error: "The request is too large." }, { status: 413 }),
    };
  }
  try {
    const body = await readTextWithinLimit(request, maxBytes);
    if (!body.ok && body.tooLarge) {
      return {
        ok: false as const,
        response: jsonResponse({ error: "The request is too large." }, { status: 413 }),
      };
    }
    if (!body.ok) throw new Error("Unreadable request body");
    return { ok: true as const, value: JSON.parse(body.text) as unknown };
  } catch {
    return {
      ok: false as const,
      response: jsonResponse(
        { error: "The request body is not valid JSON." },
        { status: 400 },
      ),
    };
  }
}
