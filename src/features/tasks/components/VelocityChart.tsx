"use client";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useVelocity } from "../api/sprints";

const CHART_HEIGHT = 240;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
const MAX_BAR_WIDTH = 48;

/** Committed vs completed points for the last sprints (categorical tokens 1 and 2). */
export default function VelocityChart() {
  const t = useTranslations("tasks.reports");
  const velocity = useVelocity();

  if (velocity.isLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
  const data = velocity.data ?? [];
  if (data.length === 0) {
    return <p className="text-sm text-text-tertiary">{t("noVelocity")}</p>;
  }
  const label = (name: unknown) =>
    name === "committedPoints" ? t("committed") : t("completed");

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke="var(--ds-border-secondary)" />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--ds-bg-tertiary)" }}
            formatter={(value, name) => [value, label(name)]}
          />
          <Legend
            formatter={(name) => (
              // Legend text stays in text ink; the swatch carries the colour.
              <span className="text-text-secondary">{label(name)}</span>
            )}
          />
          <Bar
            dataKey="committedPoints"
            fill="var(--ds-chart-1)"
            maxBarSize={MAX_BAR_WIDTH}
            radius={BAR_RADIUS}
            isAnimationActive={false}
          />
          <Bar
            dataKey="completedPoints"
            fill="var(--ds-chart-2)"
            maxBarSize={MAX_BAR_WIDTH}
            radius={BAR_RADIUS}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
