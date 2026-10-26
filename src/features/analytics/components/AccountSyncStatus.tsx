"use client";

import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useFormatter, useNow, useTranslations } from "next-intl";

import StatusBadge from "@/components/ui/StatusBadge";

import type { AnalyticsAccount } from "../types";

/** Whether an account's figures are current, and what to do when they aren't. */
export default function AccountSyncStatus({
  account,
}: {
  account: AnalyticsAccount;
}) {
  const t = useTranslations("analytics.sync");
  const format = useFormatter();
  const now = useNow();

  if (!account.analyticsEnabled) {
    return (
      <StatusBadge tone="accent" icon={<WarningOutlined aria-hidden />}>
        {t("reconnect")}
      </StatusBadge>
    );
  }
  if (account.analyticsError) {
    return (
      <Tooltip title={account.analyticsError}>
        <span>
          <StatusBadge
            tone="danger"
            icon={<ExclamationCircleOutlined aria-hidden />}
          >
            {t("failed")}
          </StatusBadge>
        </span>
      </Tooltip>
    );
  }
  if (!account.analyticsSyncedAt) {
    return (
      <StatusBadge tone="neutral" icon={<ClockCircleOutlined aria-hidden />}>
        {t("pending")}
      </StatusBadge>
    );
  }
  return (
    <span className="text-xs text-text-tertiary">
      {t("updated", {
        when: format.relativeTime(new Date(account.analyticsSyncedAt), now),
      })}
    </span>
  );
}
