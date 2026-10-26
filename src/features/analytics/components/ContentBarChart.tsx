"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
const ROW_HEIGHT = 36;
const MIN_HEIGHT = 200;
const CATEGORY_AXIS_WIDTH = 96;
const ALL_LABELS_UP_TO = 6;

export interface ContentBar {
  key: string;
  label: string;
  value: number | null;
  /** Extra line for the tooltip, e.g. "12 posts". */
  detail?: string;
}

/**
 * One measure per category, in one hue (the categories aren't series).
 * `horizontal` lists categories down the side, for long names.
 */
export default function ContentBarChart({
  bars,
  formatValue,
  horizontal = false,
  ariaLabel,
}: {
  bars: ContentBar[];
  formatValue: (value: number) => string;
  horizontal?: boolean;
  ariaLabel: string;
}) {
  const height = horizontal
    ? Math.max(MIN_HEIGHT, bars.length * ROW_HEIGHT)
    : MIN_HEIGHT;
  const valueAxis = {
    tick: AXIS_TICK,
    tickLine: false,
    axisLine: false,
    tickFormatter: formatValue,
  };
  const categoryAxis = {
    dataKey: "label",
    tick: AXIS_TICK,
    tickLine: false,
    axisLine: { stroke: "var(--ds-border-default)" },
  };

  return (
    <div dir="ltr" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={bars}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            horizontal={!horizontal}
            vertical={horizontal}
            stroke="var(--ds-border-secondary)"
          />
          {horizontal ? (
            <>
              <XAxis type="number" {...valueAxis} />
              <YAxis
                type="category"
                width={CATEGORY_AXIS_WIDTH}
                {...categoryAxis}
              />
            </>
          ) : (
            <>
              {/* A few categories all get labels; long week runs thin out. */}
              <XAxis
                {...categoryAxis}
                interval={bars.length <= ALL_LABELS_UP_TO ? 0 : "preserveEnd"}
                minTickGap={8}
              />
              <YAxis width={48} {...valueAxis} />
            </>
          )}
          <Tooltip
            cursor={{ fill: "var(--ds-bg-tertiary)" }}
            content={({ active, payload }) => {
              const bar = payload?.[0]?.payload as ContentBar | undefined;
              if (!active || !bar) return null;
              return (
                <div className="surface-panel min-w-36 text-sm shadow-lg">
                  <p className="font-medium text-text-primary">{bar.label}</p>
                  <p className="text-text-secondary tabular-nums">
                    {bar.value === null ? "—" : formatValue(bar.value)}
                  </p>
                  {bar.detail ? (
                    <p className="text-xs text-text-tertiary">{bar.detail}</p>
                  ) : null}
                </div>
              );
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--ds-chart-1)"
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={32}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
