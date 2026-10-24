import type { ReactNode } from "react";

import { TOOLBAR_SURFACE_CLASS } from "@/lib/listing-ui";

export interface ListingToolbarProps {
  /** Search and filters — rendered at the start (RTL-safe). */
  filters?: ReactNode;
  /** Primary action(s) — rendered at the end (RTL-safe). */
  actions?: ReactNode;
}

export default function ListingToolbar({
  filters,
  actions,
}: ListingToolbarProps) {
  return (
    <div
      className={`flex w-full flex-wrap items-center justify-between gap-3 ${TOOLBAR_SURFACE_CLASS}`}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {filters}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
