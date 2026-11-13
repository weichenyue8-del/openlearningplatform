export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

function parseHttpUrl(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function parseVercelUrl(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  const url = parseHttpUrl(candidate.includes("://") ? candidate : `https://${candidate}`);
  return url?.startsWith("https://") ? url : null;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = parseHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return null;

  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getSiteUrl(): string | null {
  const configuredUrl = parseHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) return configuredUrl;

  const productionUrl = parseVercelUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (productionUrl) return productionUrl;

  const deploymentUrl = parseVercelUrl(process.env.VERCEL_URL);
  if (deploymentUrl) return deploymentUrl;

  return process.env.NODE_ENV === "production" ? null : "http://localhost:3000";
}

export function getSupabaseCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
