"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { TooltipContentProps } from "recharts";

import type { SocialPlatform } from "@/config/platforms";
import { dayjs } from "@/lib/dayjs";

import { useMetricFormat } from "../hooks/use-metric-format";
import { PLATFORM_SERIES } from "../lib/platform-series";

/** Crosshair read-out: the day, then each platform's value in legend order. */
export default function TrendTooltip({
  active,
  payload,
  label,
}: Pick<TooltipContentProps<number, string>, "active" | "payload" | "label">) {
  const tPlatforms = useTranslations("common.platforms");
  const format = useFormatter();
  const fmt = useMetricFormat();
  if (!active || !payload?.length || typeof label !== "string") return null;

  return (
    <div className="surface-panel min-w-40 shadow-lg">
      <p className="mb-2 text-xs font-medium text-text-secondary">
        {format.dateTime(dayjs(label).toDate(), { dateStyle: "medium" })}
      </p>
      <ul className="flex flex-col gap-1">
        {payload.map((entry) => {
          const platform = entry.dataKey as SocialPlatform;
          return (
            <li
              key={platform}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2 text-text-secondary">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${PLATFORM_SERIES[platform].swatchClass}`}
                />
                {tPlatforms(platform)}
              </span>
              <span className="font-medium text-text-primary tabular-nums">
                {fmt.exact(
                  typeof entry.value === "number" ? entry.value : null,
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
