import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { adminCookieOptions } from "@/lib/admin-auth/admin-cookie-options";
import {
  sealAdminCookie,
  verifyAdminLogin,
} from "@/lib/admin-auth/admin-session";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth/admin-session-shared";
import { isSameOriginRequest } from "@/lib/admin-auth/same-origin";
import { BackendAuthError } from "@/lib/auth/backend-auth";

const verifyBodySchema = z.object({
  challengeToken: z.string().min(1).max(256),
  code: z.string().regex(/^\d{6}$/),
});

function failure(code: string, status: number): NextResponse {
  return NextResponse.json({ error: { code, message: code } }, { status });
}

/**
 * Second sign-in step. The password step goes straight from the browser to
 * the API; this one runs here so the refresh token lands in an httpOnly cookie.
 */
export async function POST(request: NextRequest) {
  if (
    !isSameOriginRequest(request) ||
    !request.headers.get("content-type")?.startsWith("application/json")
  ) {
    return failure("FORBIDDEN", 403);
  }
  const body = verifyBodySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return failure("VALIDATION_FAILED", 400);
  }
  try {
    const session = await verifyAdminLogin(
      body.data.challengeToken,
      body.data.code,
      request.headers.get("x-forwarded-for"),
    );
    const response = NextResponse.json({ data: { admin: session.admin } });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      await sealAdminCookie(session),
      adminCookieOptions(request),
    );
    return response;
  } catch (error) {
    if (error instanceof BackendAuthError) {
      return failure(error.code, error.status);
    }
    return failure("UNKNOWN_ERROR", 500);
  }
}
