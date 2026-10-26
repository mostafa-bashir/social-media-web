import type { SocialPlatform } from "@/config/platforms";

/**
 * Each platform keeps one categorical slot everywhere, so its colour never
 * changes with filters. The three slots are validated together for
 * colour-blind separation; a legend always names them too.
 */
export const PLATFORM_SERIES: Record<
  SocialPlatform,
  { stroke: string; swatchClass: string }
> = {
  facebook: { stroke: "var(--ds-chart-1)", swatchClass: "bg-chart-1" },
  instagram: { stroke: "var(--ds-chart-2)", swatchClass: "bg-chart-2" },
  youtube: { stroke: "var(--ds-chart-3)", swatchClass: "bg-chart-3" },
};
