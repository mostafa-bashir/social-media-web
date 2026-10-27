"use client";

import { PrinterOutlined } from "@ant-design/icons";
import { Button, Result, Skeleton } from "antd";
import { useTranslations } from "next-intl";

import { usePublicReport } from "../api/report-links";
import { printInLightTheme } from "../lib/print";
import ReportView from "./ReportView";

/** A shared client report, read-only and without the app around it. */
export default function PublicReportPage({ token }: { token: string }) {
  const t = useTranslations("analytics.share.public");
  const tReport = useTranslations("analytics.report");
  const report = usePublicReport(token);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-4 py-8">
      {report.error ? (
        <Result
          status="404"
          title={t("unavailable")}
          subTitle={t("unavailableHint")}
        />
      ) : !report.data ? (
        <Skeleton active paragraph={{ rows: 14 }} />
      ) : (
        <>
          <div className="flex justify-end print:hidden">
            <Button
              icon={<PrinterOutlined />}
              className="rounded-full!"
              onClick={printInLightTheme}
            >
              {tReport("print")}
            </Button>
          </div>
          <div className="surface-card report-print">
            <div className="surface-panel">
              <ReportView report={report.data.report} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
