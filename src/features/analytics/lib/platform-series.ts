import type { SocialPlatform } from "@/config/platforms";

/**
 * Categorical slots in their validated order, for series that aren't
 * platforms. A chart groups by platform or by account, never both, so the
 * platform series below reuse these slots without clashing.
 */
export const CATEGORICAL_STROKES = [
  "var(--ds-chart-1)",
  "var(--ds-chart-2)",
  "var(--ds-chart-3)",
  "var(--ds-chart-4)",
] as const;

/**
 * Each platform keeps one slot everywhere, so its colour never changes with
 * filters; a legend always names them too.
 */
export const PLATFORM_SERIES: Record<
  SocialPlatform,
  { stroke: string; swatchClass: string }
> = {
  facebook: { stroke: "var(--ds-chart-1)", swatchClass: "bg-chart-1" },
  instagram: { stroke: "var(--ds-chart-2)", swatchClass: "bg-chart-2" },
  youtube: { stroke: "var(--ds-chart-3)", swatchClass: "bg-chart-3" },
  tiktok: { stroke: "var(--ds-chart-4)", swatchClass: "bg-chart-4" },
};
