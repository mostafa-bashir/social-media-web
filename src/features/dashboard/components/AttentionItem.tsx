import type { ReactNode } from "react";

import type { StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/navigation";

const TONE_CLASS: Record<StatusTone, string> = {
  brand: "bg-primary-subtle text-primary-text",
  growth: "bg-growth-subtle text-growth-text",
  accent: "bg-accent-subtle text-accent-text",
  danger: "bg-danger-subtle text-danger-text",
  neutral: "bg-background-tertiary text-text-secondary",
};

export interface AttentionItemProps {
  icon: ReactNode;
  tone: StatusTone;
  count: number;
  label: string;
  href: { pathname: string; query?: Record<string, string> };
}

/** One "needs you" tile; the whole tile links to the filtered list. */
export default function AttentionItem({
  icon,
  tone,
  count,
  label,
  href,
}: AttentionItemProps) {
  return (
    <Link
      href={href}
      className="surface-panel flex items-center gap-3 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span
        aria-hidden
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${TONE_CLASS[tone]}`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-2xl font-semibold tracking-tight text-text-primary">
          {count}
        </span>
        <span className="text-sm text-text-secondary">{label}</span>
      </span>
    </Link>
  );
}
