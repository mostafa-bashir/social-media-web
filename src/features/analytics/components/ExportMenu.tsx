"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { App, Button, Dropdown } from "antd";
import { useTranslations } from "next-intl";

import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useIsClient } from "@/hooks/use-is-client";
import { usePermissions } from "@/hooks/use-permissions";

import { EXPORT_DATASETS, useExportAnalytics } from "../api/export-analytics";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";

/** CSV downloads of what the filters currently show. */
export default function ExportMenu() {
  const t = useTranslations("analytics.export");
  const { can } = usePermissions();
  const isClient = useIsClient();
  const { scope } = useAnalyticsFilters();
  const exportCsv = useExportAnalytics();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();

  if (!isClient || !can(Permission.AnalyticsExport)) return null;
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: EXPORT_DATASETS.map((dataset) => ({
          key: dataset,
          label: t(`datasets.${dataset}`),
        })),
        onClick: ({ key }) =>
          exportCsv.mutate(
            {
              scope,
              dataset: key as (typeof EXPORT_DATASETS)[number],
            },
            { onError: (error) => message.error(errorMessage(error)) },
          ),
      }}
    >
      <Button
        icon={<DownloadOutlined />}
        loading={exportCsv.isPending}
        className="rounded-full!"
      >
        {t("button")}
      </Button>
    </Dropdown>
  );
}
