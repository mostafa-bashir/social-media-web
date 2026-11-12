/**
 * The connect-link nonce lives in this tab only: the platform consent comes
 * back to the same tab, and another tab or browser must not be able to
 * finish the connect. Storage can be unavailable (private mode, blocked
 * site data); the API then refuses the connect and the page says to start
 * again, which is the safe outcome. The link token is kept beside it so the
 * callback page can offer "start again".
 */
const NONCE_KEY = "connect-link-nonce";
const TOKEN_KEY = "connect-link-token";

function read(key: string): string {
  try {
    return window.sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function saveConnectFlow(flow: { nonce: string; token: string }): void {
  try {
    window.sessionStorage.setItem(NONCE_KEY, flow.nonce);
    window.sessionStorage.setItem(TOKEN_KEY, flow.token);
  } catch {
    // Unavailable storage: see above.
  }
}

export const readConnectNonce = (): string => read(NONCE_KEY);
export const readConnectToken = (): string => read(TOKEN_KEY);
