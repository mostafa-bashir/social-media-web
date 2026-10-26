"use client";

import { TeamOutlined } from "@ant-design/icons";
import { Alert, Skeleton } from "antd";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import ListingEmptyState from "@/components/ui/ListingEmptyState";
import { useErrorMessage } from "@/hooks/use-error-message";
import { countryName } from "@/lib/countries";

import { useAudience } from "../api/get-audience";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { useMetricFormat } from "../hooks/use-metric-format";
import AgeGenderPyramid from "./AgeGenderPyramid";
import AudienceSummary from "./AudienceSummary";
import ContentBarChart from "./ContentBarChart";
import ShareList from "./ShareList";

const TOP_PLACES = 10;
const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const LIFE_STAGE_LABEL_WIDTH = 150;

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface-card flex flex-col gap-4">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

/** Who the audience is: age, gender, life stage and where they are. */
export default function AudienceTab() {
  const t = useTranslations("analytics.audience");
  const locale = useLocale();
  const fmt = useMetricFormat();
  const errorMessage = useErrorMessage();
  const { scope } = useAnalyticsFilters();
  const audience = useAudience(scope);
  const data = audience.data;
  const none = t("noData");

  if (audience.error) {
    return <Alert type="error" showIcon title={errorMessage(audience.error)} />;
  }
  if (!data) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (data.basis === null) {
    return (
      <div className="surface-card">
        <ListingEmptyState
          icon={<TeamOutlined />}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AudienceSummary audience={data} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card title={t("ageGender")}>
          {data.ageGender.length > 0 ? (
            <AgeGenderPyramid cells={data.ageGender} />
          ) : (
            <>
              <ContentBarChart
                ariaLabel={t("age")}
                formatValue={fmt.percent}
                bars={[...data.age]
                  .sort(
                    (a, b) =>
                      AGE_ORDER.indexOf(a.key) - AGE_ORDER.indexOf(b.key),
                  )
                  .map((row) => ({
                    key: row.key,
                    label: row.key,
                    value: row.share,
                  }))}
              />
              <ShareList
                rows={data.gender}
                label={(key) => t(`genders.${key}`)}
                emptyText={none}
              />
            </>
          )}
        </Card>
        <Card title={t("lifeStages.title")}>
          <ContentBarChart
            horizontal
            categoryWidth={LIFE_STAGE_LABEL_WIDTH}
            ariaLabel={t("lifeStages.title")}
            formatValue={fmt.percent}
            bars={data.lifeStages.map((row) => ({
              key: row.key,
              label: t(`lifeStages.${row.key}`),
              value: row.share,
            }))}
          />
        </Card>
        <Card title={t("countries")}>
          <ShareList
            rows={data.countries}
            limit={TOP_PLACES}
            label={(code) => countryName(code, locale)}
            emptyText={none}
          />
        </Card>
        <Card title={t("regions")}>
          {data.geo.mena > 0 ? (
            <p className="text-sm text-text-secondary">
              {t("menaShare", { share: fmt.percent(data.geo.mena) })}
            </p>
          ) : null}
          <ShareList
            rows={data.geo.subRegions}
            limit={TOP_PLACES}
            label={(key) => t(`subRegions.${key}`)}
            emptyText={none}
          />
          <ShareList
            rows={data.geo.continents}
            label={(key) => t(`continents.${key}`)}
            emptyText={none}
          />
        </Card>
        {data.cities.length > 0 ? (
          <Card title={t("cities")}>
            <ShareList
              rows={data.cities}
              limit={TOP_PLACES}
              label={(city) => city}
              emptyText={none}
            />
          </Card>
        ) : null}
      </div>
    </div>
  );
}
