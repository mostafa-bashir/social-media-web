export type ColorScheme = "light" | "dark";

export const COLOR_SCHEME_COOKIE = "color-scheme";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export function parseColorScheme(value: string | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}

export function persistColorScheme(scheme: ColorScheme): void {
  document.cookie = `${COLOR_SCHEME_COOKIE}=${scheme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
