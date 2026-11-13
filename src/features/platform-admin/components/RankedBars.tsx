"use client";

import { useFormatter } from "next-intl";
import type { ReactNode } from "react";

export interface RankedBar {
  key: string;
  label: ReactNode;
  value: number;
  /** Shown after the bar instead of the raw value, e.g. "4 of 9". */
  valueLabel?: string;
}

/**
 * Magnitude by category: one hue, longest first, every bar labelled with its
 * value (so nothing depends on reading a color or an axis). Plain HTML.
 */
export default function RankedBars({
  title,
  bars,
  max,
  empty,
}: {
  title: string;
  bars: RankedBar[];
  /** Scale end; defaults to the largest value. */
  max?: number;
  empty: string;
}) {
  const format = useFormatter();
  const scale = Math.max(max ?? 0, ...bars.map((bar) => bar.value), 1);

  return (
    <section className="surface-panel flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {bars.length === 0 ? (
        <p className="text-sm text-text-tertiary">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {bars.map((bar) => (
            <li
              key={bar.key}
              className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="truncate text-text-secondary">{bar.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-background-tertiary">
                <span
                  className="block h-full rounded-full bg-chart-1"
                  style={{ width: `${(bar.value / scale) * 100}%` }}
                />
              </span>
              <span className="tabular-nums text-text-primary">
                {bar.valueLabel ?? format.number(bar.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
