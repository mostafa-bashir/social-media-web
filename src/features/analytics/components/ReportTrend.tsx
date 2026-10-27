"use client";

import { useFormatter } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { dayjs } from "@/lib/dayjs";

import { useMetricFormat } from "../hooks/use-metric-format";

const CHART_HEIGHT = 220;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 11 };

/** Views per day for a printed report: no hover, labels readable on paper. */
export default function ReportTrend({
  points,
  ariaLabel,
}: {
  points: Array<{ date: string; value: number }>;
  ariaLabel: string;
}) {
  const fmt = useMetricFormat();
  const format = useFormatter();
  return (
    <div dir="ltr" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart
          data={points}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--ds-border-secondary)" />
          <XAxis
            dataKey="date"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--ds-border-default)" }}
            minTickGap={24}
            tickFormatter={(date: string) =>
              format.dateTime(dayjs(date).toDate(), {
                day: "numeric",
                month: "short",
              })
            }
          />
          <YAxis
            width={44}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => fmt.count(value)}
          />
          <Line
            dataKey="value"
            stroke="var(--ds-chart-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
