"use client";

import { useFormatter, useTranslations } from "next-intl";
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

import { useDayLabel } from "../hooks/use-day-label";

const CHART_HEIGHT = 220;
const AXIS_TICK = { fill: "var(--ds-text-tertiary)", fontSize: 12 };
/** Fixed order: series keep their color whatever else is shown. */
const SERIES_COLORS = ["var(--ds-chart-1)", "var(--ds-chart-2)"] as const;

export interface TrendSeries<K extends string> {
  key: K;
  label: string;
}

/**
 * Daily counts over the selected range: one or two series on one axis (same
 * unit), 2px lines, hover crosshair + tooltip, and a screen-reader table.
 */
export default function UsageTrendChart<K extends string>({
  title,
  data,
  series,
}: {
  title: string;
  data: Array<{ day: string } & Record<K, number>>;
  series: Array<TrendSeries<K>>;
}) {
  const t = useTranslations("admin.usage");
  const format = useFormatter();
  const dayLabel = useDayLabel();

  return (
    <section className="surface-panel flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div dir="ltr" aria-hidden>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--ds-border-secondary)"
            />
            <XAxis
              dataKey="day"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickFormatter={(day: string) => dayLabel(day)}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
              tickFormatter={(value: number) => format.number(value)}
            />
            <Tooltip
              labelFormatter={(day) => dayLabel(String(day), "long")}
              formatter={(value) =>
                typeof value === "number" ? format.number(value) : value
              }
            />
            {series.length > 1 ? (
              <Legend
                verticalAlign="top"
                align="right"
                iconType="plainline"
                height={28}
              />
            ) : null}
            {series.map((entry, index) => (
              <Line
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                stroke={SERIES_COLORS[index]}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: "var(--ds-bg-surface)",
                }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dayColumn")}</th>
            {series.map((entry) => (
              <th key={entry.key} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day}>
              <th scope="row">{dayLabel(row.day, "long")}</th>
              {series.map((entry) => (
                <td key={entry.key}>{row[entry.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
