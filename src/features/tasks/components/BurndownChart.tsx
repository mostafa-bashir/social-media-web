"use client";

import { Skeleton } from "antd";
import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { dayjs } from "@/lib/dayjs";

import { useBurndown } from "../api/sprints";

const CHART_HEIGHT = 260;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };

/**
 * Story points left per sprint day against the straight "ideal" line. One
 * axis; the ideal is a dashed neutral so the actual line carries the colour.
 */
export default function BurndownChart({ sprintId }: { sprintId: string }) {
  const t = useTranslations("tasks.reports");
  const burndown = useBurndown(sprintId);

  if (burndown.isLoading) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (!burndown.data) return null;
  const { days, committedPoints } = burndown.data;
  const span = Math.max(1, days.length - 1);
  const data = days.map((day, index) => ({
    date: day.date,
    remaining: day.remainingPoints,
    ideal: Math.round(committedPoints * (1 - index / span) * 10) / 10,
  }));

  if (committedPoints === 0) {
    return <p className="text-sm text-text-tertiary">{t("noPoints")}</p>;
  }
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="sr-only">
        {t("burndownSummary", {
          committed: committedPoints,
          remaining:
            [...days].reverse().find((day) => day.remainingPoints !== null)
              ?.remainingPoints ?? committedPoints,
        })}
      </figcaption>
      <div dir="ltr">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--ds-border-secondary)"
            />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={(date: string) => dayjs(date).format("D MMM")}
              minTickGap={16}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={(date) =>
                dayjs(String(date)).format("D MMM YYYY")
              }
              formatter={(value, name) => [
                value ?? "—",
                name === "remaining" ? t("remaining") : t("ideal"),
              ]}
            />
            <Legend
              formatter={(name) => (
                // Legend text stays in text ink; the swatch carries the colour.
                <span className="text-text-secondary">
                  {name === "remaining" ? t("remaining") : t("ideal")}
                </span>
              )}
            />
            <Line
              dataKey="ideal"
              stroke="var(--ds-text-tertiary)"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="remaining"
              stroke="var(--ds-chart-1)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
