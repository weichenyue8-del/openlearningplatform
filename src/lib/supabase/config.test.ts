import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl, getSupabaseConfig } from "@/lib/supabase/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase configuration", () => {
  it("requires both a valid URL and a publishable key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://openap.supabase.co/path");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", " publishable-key ");

    expect(getSupabaseConfig()).toEqual({
      url: "https://openap.supabase.co",
      publishableKey: "publishable-key",
    });

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(getSupabaseConfig()).toBeNull();
  });
});

describe("getSiteUrl", () => {
  it("prefers an explicitly configured site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://learn.example.com/path");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "openap.vercel.app");

    expect(getSiteUrl()).toBe("https://learn.example.com");
  });

  it("uses the stable Vercel production hostname before the deployment hostname", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "openap.vercel.app");
    vi.stubEnv("VERCEL_URL", "openap-git-main-team.vercel.app");

    expect(getSiteUrl()).toBe("https://openap.vercel.app");
  });

  it("falls back to the HTTPS Vercel deployment hostname", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not-a-url");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "openap-abc123.vercel.app");

    expect(getSiteUrl()).toBe("https://openap-abc123.vercel.app");
  });

  it("does not invent a localhost production URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBeNull();
  });
});
