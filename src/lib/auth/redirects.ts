const SAFE_BASE_URL = "https://openap.invalid";
const MAX_REDIRECT_LENGTH = 2_048;
const AUTH_LOOP_PATHS = [
  "/auth",
  "/forgot-password",
  "/login",
  "/sign-in",
  "/signup",
] as const;

function isAuthLoopPath(pathname: string): boolean {
  return AUTH_LOOP_PATHS.some(
    (blockedPath) => pathname === blockedPath || pathname.startsWith(`${blockedPath}/`),
  );
}

export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof value !== "string") return fallback;

  const candidate = value.trim();
  if (
    !candidate ||
    candidate.length > MAX_REDIRECT_LENGTH ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const url = new URL(candidate, SAFE_BASE_URL);
    if (url.origin !== SAFE_BASE_URL) return fallback;

    const decodedPath = decodeURIComponent(url.pathname);
    if (
      decodedPath.startsWith("//") ||
      decodedPath.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(decodedPath) ||
      isAuthLoopPath(url.pathname)
    ) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
