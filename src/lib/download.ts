const FILENAME = /filename="([^"]+)"/;
/** Revoking in the same tick as `click()` can cancel the download in some browsers. */
const REVOKE_DELAY_MS = 1_000;

/** Saves a blob as a file in the browser. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/** The server's `Content-Disposition` filename, or `fallback`. */
export function filenameFrom(disposition: unknown, fallback: string): string {
  return FILENAME.exec(String(disposition ?? ""))?.[1] ?? fallback;
}
