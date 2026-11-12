"use client";

import { Avatar } from "antd";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { countryName } from "@/lib/countries";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { Report } from "../types/report";
import AudienceSummary from "./AudienceSummary";
import ContentBarChart from "./ContentBarChart";
import KpiGrid from "./KpiGrid";
import RecommendedSlots from "./RecommendedSlots";
import ReportAudit from "./ReportAudit";
import ReportTopPosts from "./ReportTopPosts";
import ReportTrend from "./ReportTrend";
import ShareList from "./ShareList";

const LOGO_SIZE = 56;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 break-inside-avoid">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

/**
 * A client report from its data alone: the print view, share links and
 * emailed reports all render this, so they always look the same.
 */
export default function ReportView({ report }: { report: Report }) {
  const t = useTranslations("analytics.report");
  const tTypes = useTranslations("analytics.contentTypes");
  const tAudience = useTranslations("analytics.audience");
  const format = useFormatter();
  const locale = useLocale();
  const fmt = useMetricFormat();
  const day = (iso: string) =>
    format.dateTime(new Date(`${iso}T00:00:00Z`), {
      dateStyle: "long",
      timeZone: "UTC",
    });

  return (
    <article className="flex flex-col gap-8">
      <header className="flex items-center gap-4 border-b border-border-default pb-4">
        {report.client.logoUrl ? (
          <Avatar
            shape="square"
            size={LOGO_SIZE}
            src={report.client.logoUrl}
            alt=""
          />
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {t("title", { client: report.client.name })}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("range", {
              from: day(report.range.from),
              to: day(report.range.to),
            })}
          </p>
        </div>
      </header>
      {report.audit ? (
        <Section title={t("sections.audit")}>
          <ReportAudit audit={report.audit} />
        </Section>
      ) : null}
      {report.kpis ? (
        <Section title={t("sections.kpis")}>
          <KpiGrid
            totals={report.kpis.totals}
            comparison={report.kpis.comparisonTotals}
            compare={report.kpis.comparisonRange ? "previous" : "none"}
            loading={false}
          />
        </Section>
      ) : null}
      {report.trend ? (
        <Section title={t("sections.trend")}>
          <ReportTrend
            points={report.trend.points}
            ariaLabel={t("sections.trend")}
          />
        </Section>
      ) : null}
      {report.topPosts ? (
        <Section title={t("sections.topPosts")}>
          <ReportTopPosts posts={report.topPosts} />
        </Section>
      ) : null}
      {report.content ? (
        <Section title={t("sections.content")}>
          <ContentBarChart
            horizontal
            ariaLabel={t("sections.content")}
            formatValue={fmt.count}
            bars={report.content.byContentType.map((row) => ({
              key: row.contentType ?? "unknown",
              label:
                row.contentType && tTypes.has(row.contentType)
                  ? tTypes(row.contentType)
                  : "—",
              value: row.avgEngagements,
            }))}
          />
          <RecommendedSlots
            slots={report.content.recommendedSlots}
            showSchedule={false}
          />
        </Section>
      ) : null}
      {report.audience && report.audience.basis ? (
        <Section title={t("sections.audience")}>
          <AudienceSummary audience={report.audience} />
          <ShareList
            rows={report.audience.countries}
            label={(code) => countryName(code, locale)}
            emptyText={tAudience("noData")}
          />
        </Section>
      ) : null}
      <footer className="text-xs text-text-tertiary">
        {t("generated", {
          when: format.dateTime(new Date(report.generatedAt), {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        })}
      </footer>
    </article>
  );
}
