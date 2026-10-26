"use client";

import { RiseOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { Trends } from "../types/content";

/** Hashtags and content types whose recent posts beat their own usual engagement. */
export default function WhatWorksList({
  whatWorks,
}: {
  whatWorks: Trends["whatWorks"];
}) {
  const t = useTranslations("analytics.trends.whatWorks");
  const tTypes = useTranslations("analytics.contentTypes");
  const fmt = useMetricFormat();
  const entries = [
    ...whatWorks.contentTypes.map((lift) => ({
      ...lift,
      label: tTypes.has(lift.key) ? tTypes(lift.key) : lift.key,
    })),
    ...whatWorks.hashtags.map((lift) => ({ ...lift, label: `#${lift.key}` })),
  ];

  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        {t("empty", { days: whatWorks.recentDays })}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.label}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span className="min-w-0 truncate text-text-primary" dir="auto">
            {entry.label}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-growth-text">
            <RiseOutlined aria-hidden />
            {t("lift", {
              lift: fmt.percent(entry.lift),
              posts: entry.recentPosts,
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
