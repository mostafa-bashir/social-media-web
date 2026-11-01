"use client";

import { useFormatter } from "next-intl";
import { useMemo } from "react";

/** Shown for figures a platform doesn't report — never 0, which would be a claim. */
const UNKNOWN = "—";

export type KpiKind = "count" | "percent";

export interface KpiChange {
  label: string;
  tone: "growth" | "danger" | "neutral";
}

/** Compact, locale-aware KPI values and their change vs the previous period. */
export function useKpiFormat() {
  const format = useFormatter();
  return useMemo(() => {
    const value = (kind: KpiKind, figure: number | null) => {
      if (figure === null) return UNKNOWN;
      return kind === "percent"
        ? format.number(figure, { style: "percent", maximumFractionDigits: 1 })
        : format.number(figure, {
            notation: "compact",
            maximumFractionDigits: 1,
          });
    };
    /** Null when there's no base to compare against. */
    const change = (
      current: number | null,
      previous: number | null,
    ): KpiChange | null => {
      if (current === null || previous === null || previous === 0) return null;
      const ratio = (current - previous) / previous;
      return {
        label: format.number(ratio, {
          style: "percent",
          maximumFractionDigits: 0,
          signDisplay: "exceptZero",
        }),
        tone: ratio > 0 ? "growth" : ratio < 0 ? "danger" : "neutral",
      };
    };
    return { value, change };
  }, [format]);
}
