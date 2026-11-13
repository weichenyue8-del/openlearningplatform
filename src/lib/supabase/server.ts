import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig, getSupabaseCookieOptions } from "./config";

type CookieWriteMode = "best-effort" | "required";

export async function createClient(
  options: { cookieWrites?: CookieWriteMode } = {},
) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();
  const cookieWrites = options.cookieWrites ?? "best-effort";

  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        const writeCookies = () => {
          for (const { name, value, options: cookieOptions } of cookiesToSet) {
            cookieStore.set(name, value, cookieOptions);
          }
        };

        if (cookieWrites === "required") {
          writeCookies();
          return;
        }

        try {
          writeCookies();
        } catch {
          // Server Components cannot mutate response cookies. Proxy refreshes
          // sessions before render; Server Actions opt into required writes.
        }
      },
    },
  });
}

export const createSupabaseServerClient = createClient;
