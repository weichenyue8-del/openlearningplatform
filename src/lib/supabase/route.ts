import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig, getSupabaseCookieOptions } from "./config";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createSupabaseRouteClient(request: NextRequest) {
  const config = getSupabaseConfig();
  const pendingCookies: PendingCookie[] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = config
    ? createServerClient(config.url, config.publishableKey, {
        cookieOptions: getSupabaseCookieOptions(),
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            for (const cookie of cookiesToSet) {
              request.cookies.set(cookie.name, cookie.value);
            }
            pendingCookies.push(...cookiesToSet);
            Object.assign(pendingHeaders, headers);
          },
        },
      })
    : null;

  function apply<T extends NextResponse>(response: T): T {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }

    for (const [name, value] of Object.entries(pendingHeaders)) {
      response.headers.set(name, value);
    }

    return response;
  }

  return { apply, supabase };
}
