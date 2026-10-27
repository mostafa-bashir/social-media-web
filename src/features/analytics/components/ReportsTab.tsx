"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Skeleton } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Permission } from "@/config/permissions";
import { useErrorMessage } from "@/hooks/use-error-message";
import { useIsClient } from "@/hooks/use-is-client";
import { usePermissions } from "@/hooks/use-permissions";

import { useReport } from "../api/get-report";
import { useAnalyticsFilters } from "../hooks/use-analytics-filters";
import { REPORT_SECTIONS, type ReportSection } from "../types/report";
import { printInLightTheme } from "../lib/print";
import ReportView from "./ReportView";
import SchedulesCard from "./SchedulesCard";
import ShareLinksCard from "./ShareLinksCard";

/** A client report to print or save as PDF, share by link, or email on a schedule. */
export default function ReportsTab() {
  const t = useTranslations("analytics.report");
  const errorMessage = useErrorMessage();
  const { scope } = useAnalyticsFilters();
  const { can } = usePermissions();
  const isClient = useIsClient();
  const [sections, setSections] = useState<ReportSection[]>([
    ...REPORT_SECTIONS,
  ]);
  const report = useReport({
    clientId: scope.clientId,
    from: scope.from,
    to: scope.to,
    sections,
  });

  if (!scope.clientId) {
    return <Alert type="info" showIcon title={t("pickClient")} />;
  }
  return (
    <div className="flex flex-col gap-6">
      <section className="surface-card flex flex-col gap-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-text-primary">
            {t("settings")}
          </h2>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            className="rounded-full!"
            disabled={!report.data}
            onClick={printInLightTheme}
          >
            {t("print")}
          </Button>
        </div>
        <Checkbox.Group<ReportSection>
          value={sections}
          onChange={setSections}
          options={REPORT_SECTIONS.map((section) => ({
            value: section,
            label: t(`sections.${section}`),
          }))}
        />
      </section>
      {isClient && can(Permission.AnalyticsManage) ? (
        <>
          <ShareLinksCard clientId={scope.clientId} sections={sections} />
          <SchedulesCard
            clientId={scope.clientId}
            timezone={report.data?.client.timezone}
            sections={sections}
          />
        </>
      ) : null}
      {report.error ? (
        <Alert type="error" showIcon title={errorMessage(report.error)} />
      ) : sections.length === 0 ? (
        <Alert type="info" showIcon title={t("noSections")} />
      ) : !report.data ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <div className="surface-card report-print">
          <div className="surface-panel">
            <ReportView report={report.data} />
          </div>
        </div>
      )}
    </div>
  );
}
