"use client";

import { CheckCircleFilled, MinusCircleOutlined } from "@ant-design/icons";
import { Alert, Segmented, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useTenantUsageSeries } from "../api/usage";
import { USAGE_RANGES, type UsageRange } from "../types/usage";
import UsageTrendChart from "./UsageTrendChart";

/** One workspace's activity over time, plus which features it has used. */
export default function TenantUsageTab({ tenantId }: { tenantId: string }) {
  const t = useTranslations("admin.usage");
  const tFeatures = useTranslations("admin.usage.features");
  const errorMessage = useErrorMessage();
  const [days, setDays] = useState<UsageRange>(30);
  const usage = useTenantUsageSeries(tenantId, days);

  if (usage.error) {
    return <Alert type="error" showIcon title={errorMessage(usage.error)} />;
  }
  if (!usage.data) {
    return <Skeleton active />;
  }
  const { series, features } = usage.data;

  return (
    <div className="flex flex-col gap-4">
      <Segmented<UsageRange>
        className="self-start"
        aria-label={t("range")}
        value={days}
        options={USAGE_RANGES.map((value) => ({
          value,
          label: t("days", { days: value }),
        }))}
        onChange={setDays}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <UsageTrendChart
          title={t("charts.posts")}
          data={series}
          series={[
            { key: "postsCreated", label: t("charts.postsCreated") },
            { key: "postsPublished", label: t("charts.publishedSeries") },
          ]}
        />
        <UsageTrendChart
          title={t("charts.activeUsers")}
          data={series}
          series={[
            { key: "activeUsers", label: t("charts.activeUsersSeries") },
          ]}
        />
      </div>
      <section className="surface-panel">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          {t("featuresUsed")}
        </h2>
        {features ? (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(features).map(([feature, used]) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                {used ? (
                  <CheckCircleFilled className="text-growth" aria-hidden />
                ) : (
                  <MinusCircleOutlined
                    className="text-text-tertiary"
                    aria-hidden
                  />
                )}
                <span
                  className={used ? "text-text-primary" : "text-text-tertiary"}
                >
                  {tFeatures.has(feature) ? tFeatures(feature) : feature}
                  <span className="sr-only">
                    : {used ? t("used") : t("notUsed")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-tertiary">{t("charts.noSnapshot")}</p>
        )}
      </section>
    </div>
  );
}
