import { NextRequest } from "next/server";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { getClaims } = vi.hoisted(() => ({ getClaims: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getClaims } }),
}));

import {
  isGuestOnlyPathname,
  isProtectedPathname,
  updateSupabaseSession,
} from "./proxy";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

beforeEach(() => {
  getClaims.mockReset();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

afterAll(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;

  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe("Supabase Proxy routing", () => {
  it("recognizes protected routes without matching similarly named public routes", () => {
    expect(isProtectedPathname("/dashboard")).toBe(true);
    expect(isProtectedPathname("/my-learning/saved")).toBe(true);
    expect(isProtectedPathname("/dashboard-preview")).toBe(false);
    expect(isProtectedPathname("/courses")).toBe(false);
  });

  it("recognizes only guest authentication entry routes", () => {
    expect(isGuestOnlyPathname("/login")).toBe(true);
    expect(isGuestOnlyPathname("/signup")).toBe(true);
    expect(isGuestOnlyPathname("/forgot-password")).toBe(false);
  });

  it("redirects a protected page to setup-aware login when credentials are missing", async () => {
    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/dashboard?tab=progress"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fdashboard%3Ftab%3Dprogress&error=configuration",
    );
  });

  it("keeps public pages available when credentials are missing", async () => {
    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/courses"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not replay protected POST requests through a 307 redirect", async () => {
    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/dashboard", { method: "POST" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects an unauthenticated visitor when Supabase is configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://openap-test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
    getClaims.mockResolvedValue({ data: { claims: {} }, error: null });

    const response = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fdashboard",
    );
  });

  it("allows verified users into protected pages and away from guest-only entry", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://openap-test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
    getClaims.mockResolvedValue({
      data: { claims: { sub: "00000000-0000-4000-8000-000000000001" } },
      error: null,
    });

    const dashboardResponse = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/dashboard"),
    );
    const loginResponse = await updateSupabaseSession(
      new NextRequest("http://localhost:3000/login"),
    );

    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.headers.get("location")).toBeNull();
    expect(loginResponse.status).toBe(307);
    expect(loginResponse.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });
});
