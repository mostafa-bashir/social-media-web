/**
 * Bridge between the Auth.js session (React) and the axios client (plain
 * module). `ApiSessionBridge` keeps it in sync; the client reads it per request.
 */
export interface ApiSession {
  accessToken: string | null;
  workspaceSlug: string | null;
}

type Refresher = () => Promise<ApiSession | null>;
type SignOutHandler = () => void;

let current: ApiSession = { accessToken: null, workspaceSlug: null };
let refresher: Refresher | null = null;
let onSignOut: SignOutHandler | null = null;
let inFlightRefresh: Promise<ApiSession | null> | null = null;

export function setApiSession(
  session: ApiSession,
  refresh: Refresher,
  signOut: SignOutHandler,
): void {
  current = session;
  refresher = refresh;
  onSignOut = signOut;
}

export function getApiSession(): ApiSession {
  return current;
}

/** One refresh at a time per tab, however many requests hit a 401 together. */
export function refreshApiSession(): Promise<ApiSession | null> {
  if (!refresher) {
    return Promise.resolve(null);
  }
  inFlightRefresh ??= refresher().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

export function signOutFromApi(): void {
  onSignOut?.();
}
