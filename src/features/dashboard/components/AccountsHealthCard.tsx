"use client";

import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

import PlatformBadge from "@/components/ui/PlatformBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { Link } from "@/i18n/navigation";

import {
  useConnectedAccountCount,
  useReconnectAccounts,
} from "../api/get-reconnect-accounts";
import { useDashboardClient, withClient } from "../hooks/use-dashboard-client";
import DashboardCard from "./DashboardCard";

/** Connected accounts at a glance, and any that need reconnecting. */
export default function AccountsHealthCard() {
  const t = useTranslations("dashboard.accounts");
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const { clientId } = useDashboardClient();
  const allowed = can(Permission.AccountsView);
  const broken = useReconnectAccounts(allowed, clientId);
  const connected = useConnectedAccountCount(allowed, clientId);

  if (!allowed) return null;
  const total = connected.data?.meta.total ?? 0;
  const brokenAccounts = broken.data?.data ?? [];
  const accountsPath = routes.workspace(slug).accounts;

  return (
    <DashboardCard
      title={t("title")}
      href={withClient(accountsPath, clientId)}
      loading={broken.isLoading || connected.isLoading}
      error={broken.isError || connected.isError}
    >
      {total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">{t("empty")}</p>
          {can(Permission.AccountsManage) ? (
            <Link
              href={accountsPath}
              className="text-sm font-medium text-primary-text hover:underline"
            >
              {t("connect")}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            {t("connected", { count: total })}
          </p>
          {brokenAccounts.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-growth-text">
              <CheckCircleOutlined aria-hidden />
              {t("healthy")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {brokenAccounts.map((account) => (
                <li
                  key={account.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-text-primary">
                      {account.displayName}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-text-tertiary">
                      <PlatformBadge platform={account.platform} />
                      <span className="truncate">{account.client.name}</span>
                    </span>
                  </span>
                  <StatusBadge tone="danger">{t("reconnect")}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
