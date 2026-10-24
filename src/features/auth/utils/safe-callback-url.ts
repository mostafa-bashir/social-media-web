/**
 * Only same-origin relative paths are allowed after sign-in, so a crafted
 * `?callbackUrl=https://evil.example` can't turn login into an open redirect.
 */
export function safeCallbackUrl(raw: string | null, fallback: string): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\")
  ) {
    return fallback;
  }
  return raw;
}
