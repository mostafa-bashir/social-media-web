"use client";

import { Alert } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { Link } from "@/i18n/navigation";

import type { AnalyticsAccount } from "../types";

/** The one thing to fix first, if any: missing consent, failed syncs, or a first sync still running. */
export default function AnalyticsNotice({
  accounts,
}: {
  accounts: AnalyticsAccount[];
}) {
  const t = useTranslations("analytics.notice");
  const slug = useActiveWorkspaceSlug() ?? "";
  const withoutConsent = accounts.filter((a) => !a.analyticsEnabled).length;
  const failing = accounts.filter(
    (a) => a.analyticsEnabled && a.analyticsError,
  ).length;
  const waiting = accounts.filter(
    (a) => a.analyticsEnabled && !a.analyticsSyncedAt && !a.analyticsError,
  ).length;

  const accountsLink = (
    <Link
      href={routes.workspace(slug).accounts}
      className="font-medium underline"
    >
      {t("openAccounts")}
    </Link>
  );

  if (withoutConsent > 0) {
    return (
      <Alert
        type="warning"
        showIcon
        className="mb-6!"
        title={t("reconnectTitle", { count: withoutConsent })}
        description={
          <>
            {t("reconnectBody")} {accountsLink}
          </>
        }
      />
    );
  }
  if (failing > 0) {
    return (
      <Alert
        type="error"
        showIcon
        className="mb-6!"
        title={t("failedTitle", { count: failing })}
        description={t("failedBody")}
      />
    );
  }
  if (waiting > 0) {
    return (
      <Alert
        type="info"
        showIcon
        className="mb-6!"
        title={t("pendingTitle", { count: waiting })}
        description={t("pendingBody")}
      />
    );
  }
  return null;
}
