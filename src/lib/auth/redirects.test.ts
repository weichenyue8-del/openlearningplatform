import { describe, expect, it } from "vitest";

import { sanitizeRedirectPath } from "./redirects";

describe("sanitizeRedirectPath", () => {
  it("keeps local paths, query strings, and fragments", () => {
    expect(sanitizeRedirectPath("/dashboard?tab=progress#today")).toBe(
      "/dashboard?tab=progress#today",
    );
  });

  it("allows the internal password-update destination used by recovery emails", () => {
    expect(sanitizeRedirectPath("/update-password")).toBe("/update-password");
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example",
    "/%5Cevil.example",
    "/%2F%2Fevil.example",
    "/dashboard\r\nLocation: https://evil.example",
  ])("rejects an unsafe redirect target: %s", (target) => {
    expect(sanitizeRedirectPath(target)).toBe("/dashboard");
  });

  it.each(["/login", "/signup", "/forgot-password", "/auth/callback"])(
    "blocks authentication redirect loops: %s",
    (target) => {
      expect(sanitizeRedirectPath(target, "/courses")).toBe("/courses");
    },
  );

  it("uses the requested fallback for empty or oversized input", () => {
    expect(sanitizeRedirectPath(null, "/courses")).toBe("/courses");
    expect(sanitizeRedirectPath(`/${"a".repeat(2_100)}`, "/courses")).toBe("/courses");
  });
});
