"use client";

import { Skeleton } from "antd";
import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** e.g. "+12%" — shown in growth teal. */
  trend?: string;
  /** Optional status pill under the value. */
  footer?: ReactNode;
  loading?: boolean;
}

/** KPI tile (identity mockup: "Reach 48.2k +12%"). Renders inside a surface panel. */
export default function StatCard({
  label,
  value,
  icon,
  trend,
  footer,
  loading = false,
}: StatCardProps) {
  return (
    <div className="surface-panel flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-text-tertiary">{label}</span>
        {icon ? (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-subtle text-primary-text">
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <Skeleton.Input active size="small" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-text-primary">
            {value}
          </span>
          {trend ? (
            <span className="text-sm font-medium text-growth-text">
              {trend}
            </span>
          ) : null}
        </div>
      )}
      {footer}
    </div>
  );
}
