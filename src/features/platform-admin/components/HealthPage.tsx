"use client";

import { Alert, Skeleton } from "antd";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import PageHeader from "@/components/ui/PageHeader";
import { useErrorMessage } from "@/hooks/use-error-message";

import { useHealthOverview } from "../api/health";
import AccountsAttentionCard from "./AccountsAttentionCard";
import FailedJobsDrawer from "./FailedJobsDrawer";
import HealthStatusTiles from "./HealthStatusTiles";
import MigrationsCard from "./MigrationsCard";
import PublishingHealthCard from "./PublishingHealthCard";
import QueuesTable from "./QueuesTable";
import SectionUnavailable from "./SectionUnavailable";

/** System health: dependencies, background jobs, publishing, accounts, database updates. */
export default function HealthPage() {
  const t = useTranslations("admin.health");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const health = useHealthOverview();
  const [failedQueue, setFailedQueue] = useState<string | null>(null);
  const data = health.data;

  return (
    <>
      <PageHeader
        title={t("title")}
        description={
          data
            ? t("checked", {
                time: format.dateTime(new Date(data.checkedAt), {
                  timeStyle: "medium",
                }),
                snapshot: data.lastSnapshotAt
                  ? format.relativeTime(new Date(data.lastSnapshotAt))
                  : t("never"),
              })
            : t("description")
        }
      />
      {health.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(health.error)}
          className="mb-4!"
        />
      ) : null}
      {!data ? (
        <Skeleton active />
      ) : (
        <div className="flex flex-col gap-4">
          <HealthStatusTiles health={data} />
          <section className="surface-card">
            <div className="surface-panel">
              <h2 className="mb-3 text-sm font-semibold text-text-primary">
                {t("queues.title")}
              </h2>
              <QueuesTable queues={data.queues} onOpenFailed={setFailedQueue} />
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.publishing ? (
              <PublishingHealthCard publishing={data.publishing} />
            ) : (
              <SectionUnavailable title={t("publishing.title")} />
            )}
            <div className="flex flex-col gap-4">
              {data.accounts ? (
                <AccountsAttentionCard accounts={data.accounts} />
              ) : (
                <SectionUnavailable title={t("accounts.title")} />
              )}
              {data.migrations ? (
                <MigrationsCard migrations={data.migrations} />
              ) : (
                <SectionUnavailable title={t("migrations.title")} />
              )}
            </div>
          </div>
        </div>
      )}
      <FailedJobsDrawer
        queue={failedQueue}
        onClose={() => setFailedQueue(null)}
      />
    </>
  );
}
