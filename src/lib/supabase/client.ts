"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig, getSupabaseCookieOptions } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createBrowserClient(config.url, config.publishableKey, {
    cookieOptions: getSupabaseCookieOptions(),
  });
}

export const createSupabaseBrowserClient = createClient;
