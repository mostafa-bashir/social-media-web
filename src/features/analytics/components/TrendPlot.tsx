"use client";

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useBucketLabel } from "../hooks/use-bucket-label";
import { useMetricFormat } from "../hooks/use-metric-format";
import { MARKER_KEY, type TrendLine, type TrendRow } from "../lib/trend-rows";
import type { CompareMode, Granularity, TrendMetric } from "../types";
import TrendTooltip from "./TrendTooltip";

const CHART_HEIGHT = 280;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
const MARKER_RADIUS = 4;

export interface TrendPlotProps {
  rows: TrendRow[];
  lines: TrendLine[];
  metric: TrendMetric;
  granularity: Granularity;
  compare: CompareMode;
}

/** The line chart itself: one y-axis, gaps where a series didn't report, posts on the baseline. */
export default function TrendPlot({
  rows,
  lines,
  metric,
  granularity,
  compare,
}: TrendPlotProps) {
  const fmt = useMetricFormat();
  const bucketLabel = useBucketLabel(granularity);
  const axisValue = (value: number) =>
    metric === "engagementRate" ? fmt.percent(value) : fmt.count(value);

  return (
    // Charts read left to right in every locale.
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ComposedChart
          data={rows}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--ds-border-secondary)" />
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--ds-border-default)" }}
            tickFormatter={(date: string) => bucketLabel(date, "short")}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={axisValue}
          />
          <Tooltip
            content={(props) => (
              <TrendTooltip
                {...props}
                lines={lines}
                metric={metric}
                granularity={granularity}
                compare={compare}
              />
            )}
            cursor={{ stroke: "var(--ds-border-default)" }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={2}
              strokeDasharray={line.dashed ? "4 4" : undefined}
              dot={false}
              activeDot={
                line.dashed
                  ? false
                  : { r: 4, strokeWidth: 2, stroke: "var(--ds-bg-surface)" }
              }
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
          <Scatter
            dataKey={MARKER_KEY}
            fill="var(--ds-text-tertiary)"
            shape={(props: { cx?: number; cy?: number; payload?: TrendRow }) =>
              // Buckets without posts have no marker value; draw nothing there.
              props.payload?.[MARKER_KEY] === undefined ? (
                <g />
              ) : (
                <circle cx={props.cx} cy={props.cy} r={MARKER_RADIUS} />
              )
            }
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
