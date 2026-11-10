export type PillVariant = "primary" | "secondary" | "outlineOnDark";
export type PillSize = "md" | "lg";

const PILL_BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const PILL_VARIANT_CLASS: Record<PillVariant, string> = {
  primary: "bg-primary! text-text-on-color! hover:bg-primary-hover!",
  secondary:
    "border border-border-default bg-surface! text-text-primary! hover:border-primary-border hover:text-primary-text!",
  outlineOnDark:
    "border border-shell-border text-shell-text! hover:bg-shell-surface!",
};

const PILL_SIZE_CLASS: Record<PillSize, string> = {
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

/**
 * Pill CTA classes for links (antd `Button` can't render a locale-aware `Link`).
 * Colours are `!important` because antd's unlayered global `a` styles beat Tailwind layers.
 */
export function pillClassName(
  variant: PillVariant = "primary",
  size: PillSize = "md",
): string {
  return `${PILL_BASE_CLASS} ${PILL_VARIANT_CLASS[variant]} ${PILL_SIZE_CLASS[size]}`;
}
