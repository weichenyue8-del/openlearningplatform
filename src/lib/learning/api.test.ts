import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { readJsonRequest } from "./api";

describe("bounded JSON requests", () => {
  it("parses JSON within the byte limit", async () => {
    const request = new Request("http://localhost/api/test", {
      body: JSON.stringify({ answer: "ok" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const result = await readJsonRequest(request, 64);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ answer: "ok" });
  });

  it("stops reading an undeclared body once the byte cap is exceeded", async () => {
    const request = new Request("http://localhost/api/test", {
      body: JSON.stringify({ answer: "x".repeat(128) }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(request.headers.get("content-length")).toBeNull();

    const result = await readJsonRequest(request, 32);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });
});
