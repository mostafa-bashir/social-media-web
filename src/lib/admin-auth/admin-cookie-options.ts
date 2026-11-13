import type { NextRequest } from "next/server";

import { ADMIN_SESSION_MAX_AGE_SECONDS } from "./admin-session-shared";

/** `secure` follows the request, so both localhost (http) and tunnels/production (https) work. */
export function adminCookieOptions(request: NextRequest) {
  const secure =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";
  return {
    httpOnly: true,
    // Strict: the console is never entered from another site's link.
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}
