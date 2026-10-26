"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useMetricFormat } from "../hooks/use-metric-format";
import { deriveInsights, type Insight } from "../lib/insights";
import type { AnalyticsOverview, CompareMode } from "../types";

const TONE_CLASS = {
  growth: "bg-growth-subtle text-growth-text",
  danger: "bg-danger-subtle text-danger-text",
  neutral: "bg-primary-subtle text-primary-text",
} as const;

/** A few sentences on what changed, so the numbers come with a takeaway. */
export default function InsightsCard({
  overview,
  compare,
}: {
  overview?: AnalyticsOverview;
  compare: CompareMode;
}) {
  const t = useTranslations("analytics.insights");
  const tKpis = useTranslations("analytics.kpis");
  const tPlatforms = useTranslations("common.platforms");
  const fmt = useMetricFormat();
  const insights = overview ? deriveInsights(overview) : [];
  if (insights.length === 0) return null;

  const render = (
    insight: Insight,
  ): { icon: ReactNode; tone: keyof typeof TONE_CLASS; text: string } => {
    switch (insight.kind) {
      case "change":
        return {
          icon: insight.ratio > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
          tone: insight.ratio > 0 ? "growth" : "danger",
          text: t(insight.ratio > 0 ? "changeUp" : "changeDown", {
            metric: tKpis(insight.metric),
            change: fmt.percent(Math.abs(insight.ratio)),
            period: t(compare === "year" ? "lastYear" : "previousPeriod"),
          }),
        };
      case "followers":
        return {
          icon: insight.net > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
          tone: insight.net > 0 ? "growth" : "danger",
          text: t(insight.net > 0 ? "followersUp" : "followersDown", {
            count: fmt.exact(Math.abs(insight.net)),
          }),
        };
      case "topPlatform":
        return {
          icon: <TrophyOutlined />,
          tone: "neutral",
          text: t("topPlatform", {
            platform: tPlatforms(insight.platform),
            rate: fmt.percent(insight.rate),
          }),
        };
      case "cadence":
        return {
          icon: <CalendarOutlined />,
          tone: "neutral",
          text: t("cadence", {
            perWeek: fmt.count(Math.round(insight.perWeek * 10) / 10),
          }),
        };
    }
  };

  return (
    <section className="surface-card flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
        <BulbOutlined aria-hidden />
        {t("title")}
      </h2>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {insights.map((insight, index) => {
          const { icon, tone, text } = render(insight);
          return (
            <li key={index} className="surface-panel flex items-start gap-3">
              <span
                aria-hidden
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${TONE_CLASS[tone]}`}
              >
                {icon}
              </span>
              <span className="text-sm text-text-primary">{text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
