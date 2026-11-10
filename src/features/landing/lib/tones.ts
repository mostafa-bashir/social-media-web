/** Brand tones used for icon chips and highlights across the landing page. */
export type LandingTone = "primary" | "growth" | "accent";

export const TONE_CHIP_CLASS: Record<LandingTone, string> = {
  primary: "bg-primary-subtle text-primary-text",
  growth: "bg-growth-subtle text-growth-text",
  accent: "bg-accent-subtle text-accent-text",
};
