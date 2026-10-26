"use client";

import { useFormatter } from "next-intl";
import { useMemo } from "react";

/** Shown for figures a platform doesn't report — never 0, which would be a claim. */
export const UNKNOWN = "—";

export type ChangeTone = "growth" | "danger" | "neutral";

export interface Change {
  label: string;
  tone: ChangeTone;
}

/** Locale-aware formatting for report figures. */
export function useMetricFormat() {
  const format = useFormatter();
  return useMemo(() => {
    const count = (value: number | null) =>
      value === null
        ? UNKNOWN
        : format.number(value, {
            notation: "compact",
            maximumFractionDigits: 1,
          });
    const exact = (value: number | null) =>
      value === null ? UNKNOWN : format.number(value);
    const percent = (ratio: number | null) =>
      ratio === null
        ? UNKNOWN
        : format.number(ratio, { style: "percent", maximumFractionDigits: 1 });
    const signed = (value: number) =>
      format.number(value, {
        notation: "compact",
        maximumFractionDigits: 1,
        signDisplay: "exceptZero",
      });

    /** Relative change vs the previous period, or `null` when there's no base. */
    const change = (
      current: number | null,
      previous: number | null,
    ): Change | null => {
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

    return { count, exact, percent, signed, change };
  }, [format]);
}
