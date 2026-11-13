import type {
  ImpersonationInfo,
  SessionUser,
  WorkspaceSummary,
} from "@/lib/auth/session-types";

declare module "next-auth" {
  /** What the browser sees. The refresh token is deliberately absent. */
  interface Session {
    user: SessionUser;
    accessToken: string;
    accessTokenExpiresAt: number;
    activeWorkspace: WorkspaceSummary | null;
    impersonation?: ImpersonationInfo;
    error?: "RefreshFailed";
  }

  /** Returned by the credentials provider's `authorize`. */
  interface User {
    sessionUser: SessionUser;
    accessToken: string;
    accessTokenExpiresAt: number;
    /** Empty for support sessions, which are never refreshed. */
    refreshToken: string;
    activeWorkspace: WorkspaceSummary | null;
    impersonation?: ImpersonationInfo;
  }
}

declare module "next-auth/jwt" {
  /** Encrypted cookie contents, readable only by the Next.js server. */
  interface JWT {
    user: SessionUser;
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    activeWorkspace: WorkspaceSummary | null;
    impersonation?: ImpersonationInfo;
    error?: "RefreshFailed";
  }
}
