import type { ReactNode } from "react";

import { LISTING_PAGE_CLASS } from "@/lib/listing-ui";

export interface ListingShellProps {
  /** Filters / actions row — use `ListingToolbar`. Stays frozen above the content. */
  toolbar?: ReactNode;
  /** `table` — surface panel (default). `grid` — cards sit on the gray shell. */
  contentLayout?: "table" | "grid";
  /** Set false when a parent already provides the flex height. */
  fillPage?: boolean;
  children: ReactNode;
}

/**
 * Standard listing layout (fana pattern): gray outer shell › surface panel
 * with a toolbar on top and the table / grid / empty state beneath it.
 */
export default function ListingShell({
  toolbar,
  contentLayout = "table",
  fillPage = true,
  children,
}: ListingShellProps) {
  const panelClass =
    contentLayout === "grid"
      ? "listing-shell-panel listing-shell-panel--grid"
      : "listing-shell-panel";

  const shell = (
    <div className="listing-shell">
      <div className={panelClass}>
        {toolbar ? (
          <div className="listing-shell-toolbar">{toolbar}</div>
        ) : null}
        <div className="listing-shell-content">{children}</div>
      </div>
    </div>
  );

  return fillPage ? <div className={LISTING_PAGE_CLASS}>{shell}</div> : shell;
}
