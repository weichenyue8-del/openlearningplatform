import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sanitizeRedirectPath } from "@/lib/auth/redirects";

import { createSupabaseRouteClient } from "./route";

const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/settings",
  "/my-learning",
  "/my-mistakes",
] as const;

const GUEST_ONLY_PATHS = ["/login", "/sign-in", "/signup"] as const;

function matchesPathPrefix(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isProtectedPathname(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => matchesPathPrefix(pathname, path));
}

export function isGuestOnlyPathname(pathname: string): boolean {
  return GUEST_ONLY_PATHS.some((path) => matchesPathPrefix(pathname, path));
}

function isPageNavigation(request: NextRequest): boolean {
  return request.method === "GET" || request.method === "HEAD";
}

function loginRedirect(request: NextRequest, error?: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set(
    "next",
    sanitizeRedirectPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );
  if (error) loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
}

export async function updateSupabaseSession(request: NextRequest) {
  const routeClient = createSupabaseRouteClient(request);
  const isProtected = isProtectedPathname(request.nextUrl.pathname);
  const isNavigation = isPageNavigation(request);

  if (!routeClient.supabase) {
    const response =
      isNavigation && isProtected
        ? loginRedirect(request, "configuration")
        : NextResponse.next({ request });
    return routeClient.apply(response);
  }

  let authenticated = false;
  let sessionCheckFailed = false;

  try {
    const { data, error } = await routeClient.supabase.auth.getClaims();
    authenticated = !error && typeof data?.claims?.sub === "string";
    sessionCheckFailed = Boolean(error);
  } catch {
    sessionCheckFailed = true;
  }

  if (isNavigation && isProtected && !authenticated) {
    return routeClient.apply(loginRedirect(request, sessionCheckFailed ? "session" : undefined));
  }

  if (isNavigation && authenticated && isGuestOnlyPathname(request.nextUrl.pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return routeClient.apply(NextResponse.redirect(dashboardUrl));
  }

  return routeClient.apply(NextResponse.next({ request }));
}
