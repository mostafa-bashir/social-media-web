"use client";

import { FileTextOutlined } from "@ant-design/icons";
import { Alert, Skeleton } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useContentInsights } from "../api/get-content";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { useMetricFormat } from "../hooks/use-metric-format";
import BestTimeHeatmap from "./BestTimeHeatmap";
import ContentBarChart from "./ContentBarChart";
import HashtagTable from "./HashtagTable";
import RecommendedSlots from "./RecommendedSlots";
import TrendsCard from "./TrendsCard";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-card flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {hint ? <p className="text-sm text-text-secondary">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** What kind of content works, when to post it, and what's trending. */
export default function ContentTab() {
  const t = useTranslations("analytics.content");
  const tTypes = useTranslations("analytics.contentTypes");
  const errorMessage = useErrorMessage();
  const fmt = useMetricFormat();
  const format = useFormatter();
  const { scope } = useAnalyticsFilters();
  const content = useContentInsights(scope);
  const data = content.data;
  const posts = (count: number) => t("postsCount", { count });

  if (content.error) {
    return <Alert type="error" showIcon title={errorMessage(content.error)} />;
  }
  if (!data) return <Skeleton active paragraph={{ rows: 10 }} />;

  return (
    <div className="flex flex-col gap-6">
      {data.postsAnalyzed === 0 ? (
        <div className="surface-card">
          <ListingEmptyState
            icon={<FileTextOutlined />}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      ) : (
        <>
          {data.truncated ? (
            <Alert
              type="info"
              showIcon
              title={t("truncated", { count: data.postsAnalyzed })}
            />
          ) : null}
          <Section title={t("byType.title")} hint={t("byType.hint")}>
            <ContentBarChart
              horizontal
              ariaLabel={t("byType.title")}
              formatValue={fmt.count}
              bars={data.byContentType.map((row) => ({
                key: row.contentType ?? "unknown",
                label:
                  row.contentType && tTypes.has(row.contentType)
                    ? tTypes(row.contentType)
                    : t("unknownType"),
                value: row.avgEngagements,
                detail: posts(row.posts),
              }))}
            />
          </Section>
          <Section
            title={t("bestTimes.title")}
            hint={t("bestTimes.timezone", { timezone: data.timezone })}
          >
            <BestTimeHeatmap slots={data.bestTimes} />
            <RecommendedSlots
              slots={data.recommendedSlots}
              clientId={scope.clientId}
            />
          </Section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Section title={t("frequency.title")} hint={t("frequency.hint")}>
              <ContentBarChart
                ariaLabel={t("frequency.title")}
                formatValue={fmt.exact}
                bars={data.postingFrequency.map((week) => ({
                  key: week.weekStart,
                  label: format.dateTime(
                    new Date(`${week.weekStart}T00:00:00Z`),
                    {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    },
                  ),
                  value: week.posts,
                  detail:
                    week.avgEngagements === null
                      ? undefined
                      : t("frequency.detail", {
                          engagements: fmt.count(week.avgEngagements),
                        }),
                }))}
              />
            </Section>
            <Section title={t("captions.title")} hint={t("captions.hint")}>
              <ContentBarChart
                ariaLabel={t("captions.title")}
                formatValue={fmt.count}
                bars={data.captionLengths.map((bucket) => ({
                  key: bucket.bucket,
                  label: t(`captions.buckets.${bucket.bucket}`),
                  value: bucket.avgEngagements,
                  detail: posts(bucket.posts),
                }))}
              />
            </Section>
          </div>
          <Section title={t("hashtags.title")} hint={t("hashtags.hint")}>
            <HashtagTable hashtags={data.hashtags} />
          </Section>
        </>
      )}
      <TrendsCard scope={scope} />
    </div>
  );
}
