import type { NextRequest } from "next/server";

/**
 * CSRF guard for the admin session route handlers. A cross-site page can
 * send a "simple" text/plain POST that skips the CORS preflight, so the
 * Origin header must match the host the browser actually used (behind a
 * proxy or tunnel that's `x-forwarded-host`, not the internal URL).
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return host !== null && new URL(origin).host === host;
  } catch {
    return false;
  }
}
