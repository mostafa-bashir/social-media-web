import { type NextRequest, NextResponse } from "next/server";

import { adminCookieOptions } from "@/lib/admin-auth/admin-cookie-options";
import {
  ensureFreshAdminSession,
  openAdminCookie,
  revokeAdminSession,
  sealAdminCookie,
} from "@/lib/admin-auth/admin-session";
import {
  ADMIN_SESSION_COOKIE,
  type AdminBrowserSession,
} from "@/lib/admin-auth/admin-session-shared";
import { isSameOriginRequest } from "@/lib/admin-auth/same-origin";

const NO_STORE = { "Cache-Control": "no-store" };

function signedOut(): NextResponse {
  const response = NextResponse.json(
    { error: { code: "ADMIN_UNAUTHENTICATED" } },
    { status: 401, headers: NO_STORE },
  );
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

/**
 * The console's session: returns a fresh access token, refreshing (and
 * re-sealing the cookie) when it is about to expire. Route handlers can write
 * cookies, so the rotated refresh token is always persisted.
 */
export async function GET(request: NextRequest) {
  const current = await openAdminCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!current) {
    return signedOut();
  }
  const fresh = await ensureFreshAdminSession(
    current,
    request.headers.get("x-forwarded-for"),
  );
  if (!fresh) {
    return signedOut();
  }

  const body: AdminBrowserSession = {
    accessToken: fresh.session.accessToken,
    accessTokenExpiresAt: fresh.session.accessTokenExpiresAt,
    admin: fresh.session.admin,
  };
  const response = NextResponse.json({ data: body }, { headers: NO_STORE });
  if (fresh.refreshed) {
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      await sealAdminCookie(fresh.session),
      adminCookieOptions(request),
    );
  }
  return response;
}

/**
 * Sign out: revokes the API session, then clears the cookie. If the API
 * can't confirm the revocation the cookie is kept and 502 returned, so the
 * console can say so instead of pretending the session ended.
 */
export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN" } },
      { status: 403, headers: NO_STORE },
    );
  }
  const current = await openAdminCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (current) {
    try {
      await revokeAdminSession(
        current.refreshToken,
        request.headers.get("x-forwarded-for"),
      );
    } catch {
      return NextResponse.json(
        { error: { code: "ADMIN_LOGOUT_FAILED" } },
        { status: 502, headers: NO_STORE },
      );
    }
  }
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
