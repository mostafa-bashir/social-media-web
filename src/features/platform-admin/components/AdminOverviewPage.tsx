"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Alert, App, Button, Segmented } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import PageHeader from "@/components/ui/PageHeader";
import PlatformBadge from "@/components/ui/PlatformBadge";
import { platformSchema } from "@/config/platforms";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useAdminSessionQuery } from "../api/admin-session";
import { useRefreshUsage, useUsageOverview } from "../api/usage";
import { USAGE_RANGES, type UsageRange } from "../types/usage";
import RankedBars from "./RankedBars";
import UsageKpiTiles from "./UsageKpiTiles";
import UsageTenantLists from "./UsageTenantLists";
import UsageTrendChart from "./UsageTrendChart";

/** Platform health at a glance: growth, activity, publishing and adoption. */
export default function AdminOverviewPage() {
  const t = useTranslations("admin.usage");
  const tFeatures = useTranslations("admin.usage.features");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const isSuperAdmin =
    useAdminSessionQuery().data?.admin.role === "super_admin";
  const [days, setDays] = useState<UsageRange>(30);
  const overview = useUsageOverview(days);
  const refresh = useRefreshUsage();
  const data = overview.data;
  const measured = data?.featureAdoption.tenantsMeasured ?? 0;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={
          data?.lastSnapshotAt
            ? t("updated", {
                time: format.relativeTime(new Date(data.lastSnapshotAt)),
              })
            : t("neverUpdated")
        }
        extra={
          <>
            <Segmented<UsageRange>
              aria-label={t("range")}
              value={days}
              options={USAGE_RANGES.map((value) => ({
                value,
                label: t("days", { days: value }),
              }))}
              onChange={setDays}
            />
            {isSuperAdmin ? (
              <Button
                icon={<ReloadOutlined />}
                className="rounded-full!"
                loading={refresh.isPending}
                onClick={() =>
                  refresh.mutate(undefined, {
                    onSuccess: ({ queued }) =>
                      queued
                        ? message.success(t("refreshQueued"))
                        : message.info(t("refreshRunning")),
                    onError: (error) => message.error(errorMessage(error)),
                  })
                }
              >
                {t("refresh")}
              </Button>
            ) : null}
          </>
        }
      />
      {overview.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(overview.error)}
          className="mb-4!"
        />
      ) : null}
      <UsageKpiTiles overview={data} loading={overview.isLoading} />
      {data ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <UsageTrendChart
            title={t("charts.activeUsers")}
            data={data.series}
            series={[
              { key: "activeUsers", label: t("charts.activeUsersSeries") },
            ]}
          />
          <UsageTrendChart
            title={t("charts.growth")}
            data={data.series}
            series={[
              { key: "newUsers", label: t("charts.newUsers") },
              { key: "newTenants", label: t("charts.newTenants") },
            ]}
          />
          <UsageTrendChart
            title={t("charts.published")}
            data={data.series}
            series={[
              { key: "postsPublished", label: t("charts.publishedSeries") },
            ]}
          />
          <RankedBars
            title={t("charts.byPlatform")}
            empty={t("charts.noPosts")}
            bars={data.publishedByPlatform.map((row) => {
              const platform = platformSchema.safeParse(row.platform);
              return {
                key: row.platform,
                label: platform.success ? (
                  <PlatformBadge platform={platform.data} />
                ) : (
                  row.platform
                ),
                value: row.posts,
              };
            })}
          />
          <RankedBars
            title={t("charts.adoption", { count: measured })}
            empty={t("charts.noSnapshot")}
            max={measured}
            bars={(measured > 0 ? data.featureAdoption.features : []).map(
              (row) => ({
                key: row.feature,
                label: tFeatures.has(row.feature)
                  ? tFeatures(row.feature)
                  : row.feature,
                value: row.tenants,
                valueLabel: format.number(row.tenants / measured, {
                  style: "percent",
                  maximumFractionDigits: 0,
                }),
              }),
            )}
          />
          <div className="grid gap-4">
            <UsageTenantLists overview={data} />
          </div>
        </div>
      ) : null}
    </>
  );
}
