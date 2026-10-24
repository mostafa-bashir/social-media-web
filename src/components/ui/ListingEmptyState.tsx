"use client";

import { Button } from "antd";
import type { ReactNode } from "react";

import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

export interface ListingEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Compact variant for "no results for these filters". */
  compact?: boolean;
}

function EmptyIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      fill="none"
      className="h-28 w-28 text-primary-border"
    >
      <rect
        x="22"
        y="20"
        width="76"
        height="80"
        rx="12"
        fill="currentColor"
        opacity="0.35"
      />
      <rect
        x="34"
        y="36"
        width="40"
        height="6"
        rx="3"
        className="fill-primary"
        opacity="0.5"
      />
      <rect x="34" y="52" width="52" height="6" rx="3" fill="currentColor" />
      <rect x="34" y="66" width="44" height="6" rx="3" fill="currentColor" />
      <circle cx="88" cy="86" r="16" className="fill-growth" />
      <path
        d="M81 86h14M88 79v14"
        className="stroke-text-on-color"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Shared empty state for listings — never build per-feature empty states. */
export default function ListingEmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false,
}: ListingEmptyStateProps) {
  if (compact) {
    return (
      <p className="px-6 py-10 text-center text-sm text-text-tertiary">
        {title}
      </p>
    );
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {icon ?? <EmptyIllustration />}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button
          type="primary"
          className={PRIMARY_PILL_BUTTON_CLASS}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
