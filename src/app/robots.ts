import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/supabase/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard",
        "/forgot-password",
        "/login",
        "/my-learning",
        "/my-mistakes",
        "/practice/results/",
        "/profile",
        "/settings",
        "/sign-in",
        "/signup",
        "/update-password",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
