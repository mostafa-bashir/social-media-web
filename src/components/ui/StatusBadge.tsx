import type { ReactNode } from "react";

export type StatusTone = "brand" | "growth" | "accent" | "danger" | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  brand: "bg-primary-subtle text-primary-text",
  growth: "bg-growth-subtle text-growth-text",
  accent: "bg-accent-subtle text-accent-text",
  danger: "bg-danger-subtle text-danger-text",
  neutral: "bg-background-tertiary text-text-secondary",
};

/** Soft pill for statuses — e.g. "3 pending approval" (accent), "Owner" (brand). */
export default function StatusBadge({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: StatusTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASS[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
