import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Page-level actions, aligned to the end (RTL-safe). */
  extra?: ReactNode;
}

/** Page title row. Plain markup, so it renders in Server Components too. */
export default function PageHeader({
  title,
  description,
  extra,
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {extra ? <div className="flex shrink-0 gap-3">{extra}</div> : null}
    </div>
  );
}
